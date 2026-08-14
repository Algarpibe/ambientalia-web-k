/**
 * Migas de pan `ol.kunak-breadcrumbs`. **La ÚNICA implementación del clon** —
 * si hace falta saber quién la usa, se deriva:
 *
 *     grep -rn "components/Breadcrumb" src/
 *
 * ⚠ Aquí había una lista de consumidores escrita a mano, y **era falsa**:
 * nombraba cuatro páginas que no importaban nada y tenían su propia copia. Se
 * leyó como si fuera cierta y con ella se dio por CERRADA la clase del tope de
 * 350, que en realidad llegaba a 3 de 7 (A-QA1b, `PENDIENTES-QA.md`). No se
 * vuelve a poner: una lista a mano se pudre en el primer refactor y no hay
 * nada que la verifique; el grep no puede mentir.
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
  /**
   * La clase SEMÁNTICA del eslabón, tal como la sirve el original.
   *
   * ⚠ **No es decoración: es el canal con el que el original declara QUÉ es
   * cada eslabón**, y este proyecto ya lo usa como discriminador —
   * `qa:lh-jerarquia` deriva el padre de un término de
   * `<li class="taxonomia padre">`, y lo llama «vía 2».
   *
   * Aparece en los archivos de término (`taxonomia padre` · `categoria`) y
   * **no** en las páginas de entrada: medido, **0 de 149** entradas llevan
   * clase en sus `<li>`. Por eso es opcional y por eso no se inventa donde el
   * original no la pone — emitirla en todas convertiría en ubicuo un patrón
   * cuyo trabajo es discriminar (§sondas 4, el complementario).
   */
  clase?: string;
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
  envoltorio = "propio",
}: {
  items: BreadcrumbItem[];
  /** Retícula de la fila. Por defecto la de las páginas de producto (80%). */
  rowClassName?: string;
  /**
   * Qué plantilla las pinta. **Solo cambia la interlínea** — el truncado del
   * último eslabón bajó al defecto en A-QA1, porque está en las 7 formas.
   */
  variante?: "producto" | "caso";
  /**
   * `"propio"` — la miga trae su `<nav>` y su fila, que es como vive en las 11
   * rutas anteriores: fuera de `main > section`, por la partición D2.
   *
   * `"heredado"` — devuelve **sólo el `<ol>`**, para las plantillas donde la
   * miga es un MÓDULO dentro de una fila que ya existe. Es el caso de `L1`: en
   * el original está en `et_pb_text_0_tb_body.breadcrumbs`, dentro de
   * `section_0 → row_0 → column_4_4`, y montarle aquí otra fila metería una
   * `.et_pb_row` de más — que el barrido cuenta (`nFilas` es eje `plantilla`).
   *
   * ⚠ Es una prop y no un componente nuevo **a propósito**: la cabecera de este
   * fichero dice que ésta es la ÚNICA implementación del clon, y la razón está
   * pagada — cuatro páginas con su copia a mano dieron por cerrada una clase que
   * llegaba a 3 de 7. Una segunda miga «para listados» sería esa historia otra
   * vez con otro nombre.
   */
  envoltorio?: "propio" | "heredado";
}) {
  const esCaso = variante === "caso";
  const lista = (
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
              : "") +
            /* La clase semántica del original va AL FINAL y sin tocar lo de
               arriba: es marcado servido, no estilo del clon. */
            (item.clase ? ` ${item.clase}` : "")
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
  );

  if (envoltorio === "heredado") return lista;

  return (
    <nav aria-label="Migas de pan" className="bg-white">
      {/* `data-fila`: en el original la miga ES una `.et_pb_row` dentro de una
          sección; en el clon vive en un `<nav>` fuera de `main > section` (la
          partición D2). Sin marcador, `ancho-cuerpo` no podía verla por ningún
          lado y la miga del original salía huérfana en ~29 rutas. */}
      <div data-fila="" className={rowClassName + " py-[12px]"}>{lista}</div>
    </nav>
  );
}
