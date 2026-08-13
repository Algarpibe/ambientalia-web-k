/**
 * LA BARRA LATERAL DE `LISTADO-B` — 4 widgets, **una sola firma en 80
 * documentos**.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ SU CONTENIDO VA CABLEADO, Y NO ES PEREZA
 *
 * Derivado sobre la población entera de la captura (`qa:lh-barra`, negativo 5/5):
 * **80 documentos con barra · 1 sola firma · varianza 0**. En régimen
 * PLANTILLADO eso significa **plantilla**, no campo — el discriminador ahí es la
 * varianza ENTRE INSTANCIAS, y aplicar el test del builder daría la respuesta
 * invertida.
 *
 * ── El widget «Categorías» está DESINCRONIZADO, y se replica así ──────────
 * `D3` preguntaba si el widget consume la taxonomía. **No la consume**, medido:
 *
 * | | |
 * |---|---|
 * | tipo | `et_pb_widget widget_text` en **80/80** — no el nativo `widget_categories` |
 * | contenidos distintos | **1** en los 80 |
 * | términos vivos | **7** (`articulos` 240 · `noticias` 72 · `eventos` 43 · `articulos-cientificos-y-estudios` 42 · `evaluaciones-independientes` 16 · `podcast-es` 4 · `articulos-tecnicos` 1) |
 * | términos que LISTA | **2** — `eventos` y `noticias` |
 *
 * O sea que **no cubre 5 de los 7 términos que el contenido ejerce**: es
 * evidencia POSITIVA de que la lista no se regenera. Regenerarla desde la
 * taxonomía sería **arreglar el original en vez de clonarlo**, y además
 * inventaría 5 enlaces que el original no sirve.
 *
 * ⚠ **Se replica DESINCRONIZADA, y eso se anota en el DATO, no se arregla.**
 * El día que el CMS de destino quiera un widget que sí consuma la taxonomía,
 * eso es una decisión de producto con su ficha — no una corrección de fidelidad.
 *
 * ── Lo que esta barra NO tiene medido ─────────────────────────────────────
 * · **`SP-B4`** — el buscador es una INTERACCIÓN y `P-LH-C6` no la midió (su
 *   alcance eran hover, paginación, lazy y orden). Está **SIN MEDIR**, no «sin
 *   efecto»: se replica el marcado y lo que hace al enviarse queda pendiente;
 * · la newsletter es una **integración externa**, no contenido. El original
 *   sirve un `<span>` con la URL en base64 (`kunak-obfuscated-link`), y eso se
 *   replica tal cual porque es lo servido;
 * · **`text-1` va sin título y con `<div class="textwidget"></div>` vacío** — es
 *   un widget servido y sin contenido, **no un hueco de medición**. Se emite
 *   igual: quitarlo cambiaría el nº de hijos de la barra.
 */

/** La lista cableada del original, verbatim. Dos términos de los siete vivos. */
const CATEGORIAS_DEL_WIDGET = [
  { id: 13, slug: "eventos", nombre: "Eventos" },
  { id: 14, slug: "noticias", nombre: "Noticias" },
];

export function BarraLateral({
  conBorde,
  hrefCategoria,
}: {
  /**
   * `et_pb_with_border` — lo lleva **`/blog` y no `/etiqueta`**, medido en las
   * dos instancias. Es una clase del módulo, o sea plantilla de la variante.
   */
  conBorde: boolean;
  /** `(slug) => href`. Aplica la regla de rutas locales de quien la usa. */
  hrefCategoria: (slug: string) => string;
}) {
  return (
    <div
      className={
        (conBorde ? "et_pb_with_border " : "") +
        "et_pb_module et_pb_sidebar_0_tb_body et_pb_widget_area clearfix" +
        " et_pb_widget_area_right et_pb_bg_layout_light"
      }
    >
      {/* 1 · Buscar — `search-6`. SP-B4: la interacción está SIN MEDIR. */}
      <div id="search-6" className="et_pb_widget widget_search">
        <h4 className="widgettitle">Buscar</h4>
        <form role="search" method="get" id="searchform" className="searchform" action="https://kunakair.com/es/">
          <div>
            <label className="screen-reader-text" htmlFor="s">
              Buscar:
            </label>
            <input type="text" defaultValue="" name="s" id="s" />
            <input type="submit" id="searchsubmit" defaultValue="Buscar" />
          </div>
        </form>
      </div>

      {/* 2 · `text-1` — servido, sin título y VACÍO. No es un hueco. */}
      <div id="text-1" className="et_pb_widget widget_text">
        <div className="textwidget" />
      </div>

      {/* 3 · Categorías — `widget_text` con la lista CABLEADA y desincronizada. */}
      <div id="text-7" className="et_pb_widget widget_text">
        <h4 className="widgettitle">Categorías</h4>
        <div className="textwidget">
          <ul>
            {CATEGORIAS_DEL_WIDGET.map((c) => (
              <li key={c.slug} className={`cat-item cat-item-${c.id}`}>
                <a href={hrefCategoria(c.slug)}>{c.nombre}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4 · Newsletter — integración externa. El `data-url` va en base64 como
          en el original: es lo servido, y descodificarlo sería editarlo. */}
      <div id="custom_html-25" className="widget_text et_pb_widget widget_custom_html">
        <h4 className="widgettitle">¡Suscríbete a nuestra newsletter!</h4>
        <div className="textwidget custom-html-widget">
          <span
            className="et_pb_button boton-azul kunak-obfuscated-link convertible"
            role="link"
            tabIndex={0}
            data-url="aHR0cHM6Ly9rdW5ha2Fpci5jb20vZXMvc3VzY3JpYmV0ZS8="
          >
            Me apunto
          </span>
        </div>
      </div>
    </div>
  );
}
