import type { DocumentoCientifico } from "@/types/kunak";

/**
 * LA TARJETA DE `L3` — `article.scientific-docs` del `loop-del-tema`.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * QUÉ LEE EL BARRIDO DE ESTA TARJETA, Y POR TANTO QUÉ TIENE QUE EMITIR
 *
 * `lh-barrido` busca por ROL con el selector que casa al lado, y `sel` es eje
 * **plantilla**: emitir otro envoltorio es una diferencia por sí misma aunque
 * el texto sea el mismo.
 *
 * | rol | selector que casa en el original |
 * |---|---|
 * | `media` · `envoltorioMedia` | `.scientific-imagen-container` |
 * | `titulo` | **`.scientific-title`** (`h3`), con el `href` de la DESCARGA |
 * | `categoria` | `a[href*='/scientific-category/']` |
 * | `meta` | `.scientific-taxonomies` |
 * | `extracto` | **`.scientific-excerpt`** — un `<div>`, no un `<p>` |
 * | `fecha` | **null**: esta tarjeta no lleva |
 *
 * ⚠ **`.scientific-title` y `.scientific-excerpt` son exactamente los dos
 * selectores que la 78.ª tuvo que añadir al barrido** porque estaban muertos o
 * ausentes: el título salía por el fallback `h3` —dato bueno por el selector
 * equivocado— y el extracto salía `null` en las 16 tarjetas de esta forma.
 *
 * ── El titular apunta al PDF, no al documento ─────────────────────────────
 * El `<a>` del `h3` y el de la imagen llevan **`descarga.href`** (el PDF o la
 * publicación externa, con `target="_blank"`); el enlace al documento clonado
 * está sólo en el **«Seguir leyendo»** del extracto. Medido en las 23: los
 * `hrefs` de la tarjeta son, en orden, **descarga · término · documento**.
 *
 * ── Las clases del `<article>` ────────────────────────────────────────────
 * `post_class()` del CPT `scientific-docs`. **`post-<ID>` NO se puede
 * reproducir** —el ID de WordPress no está en el modelo—; su ausencia sale como
 * diferencia de eje **mixta**, que es el cubo declarado *sin referencia limpia*.
 * Inventar un número sí sería un defecto: haría pasar por dato algo que nadie
 * midió.
 *
 * ── ⚠ LA FOTO: el original sirve la variante `-724x1024` y el clon NO la tiene ─
 * Las **23 de 23** tarjetas usan esa variante de WordPress, y el almacén de
 * media del clon **no la genera**: sus tamaños declarados son `300` · `480` ·
 * `768` · `980` · `1280` y el original. Se sirve el **original** (`portada.src`),
 * que es la misma imagen a otro tamaño y se pinta igual (`background-size:
 * cover` dentro de una caja de `max-width: 164px` y `aspect-ratio: 4/3.75`).
 *
 * **Y no es un par comparado**: el barrido lee `media` como
 * `.scientific-imagen-container`, cuyo `backgroundImage` computa `none` — la URL
 * vive en el `<span>` de dentro, que ningún rol mira. Se declara igualmente,
 * porque una desviación que nadie mide es exactamente la que se olvida. Ficha:
 * `PENDIENTES-QA.md` §F3-LH-VARIANTE-724x1024.
 */
export function TarjetaCientifica({
  doc,
  extracto,
  hrefDocumento,
  hrefTermino,
}: {
  doc: DocumentoCientifico;
  /** Ya cortado por la consulta (bytes sobre el crudo, tope 100). */
  extracto: { texto: string; recortado: boolean };
  /** Ruta LOCAL del documento: las 23 están clonadas en `/recursos/…`. */
  hrefDocumento: string;
  /** Ruta LOCAL del archivo del término. */
  hrefTermino: string;
}) {
  const clases = [
    "scientific-docs",
    "type-scientific-docs",
    "status-publish",
    ...(doc.portada ? ["has-post-thumbnail"] : []),
    "hentry",
    `scientific-category-${doc.categoria.slug}`,
  ].join(" ");

  return (
    <article className={clases}>
      <div className="scientific-imagen-container">
        <a href={doc.descarga.href} target="_blank" rel="noreferrer">
          <span className="scientific-imagen" style={{ backgroundImage: `url(${doc.portada.src})` }} />
          <span className="scientific-ico">
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="25" viewBox="0 0 21 28">
              <path
                id="Trazado_25"
                data-name="Trazado 25"
                d="M0,0A3.5,3.5,0,0,1-3.5,3.5h-14A3.5,3.5,0,0,1-21,0h1.75A1.749,1.749,0,0,0-17.5,1.75h14A1.748,1.748,0,0,0-1.75,0ZM-7.875-14A2.626,2.626,0,0,1-10.5-16.625V-22.75h-7A1.75,1.75,0,0,0-19.25-21v8.75H-21V-21a3.5,3.5,0,0,1,3.5-3.5h8.537a2.635,2.635,0,0,1,1.859.769L-.771-17.4A2.638,2.638,0,0,1,0-15.537v3.287H-1.75V-14Zm5.868-2.155-6.338-6.339a.849.849,0,0,0-.4-.23v6.1a.878.878,0,0,0,.875.875h6.1A.835.835,0,0,0-2.007-16.155ZM-16.187-10.5a3.064,3.064,0,0,1,3.063,3.063,3.064,3.064,0,0,1-3.063,3.063h-.437v1.75a.876.876,0,0,1-.875.875.876.876,0,0,1-.875-.875v-7A.876.876,0,0,1-17.5-10.5Zm1.313,3.063A1.309,1.309,0,0,0-16.187-8.75h-.437v2.625h.438A1.309,1.309,0,0,0-14.875-7.437Zm2.625-2.187a.878.878,0,0,1,.875-.875h1.313A2.626,2.626,0,0,1-7.437-7.875v3.5A2.626,2.626,0,0,1-10.062-1.75h-1.312a.878.878,0,0,1-.875-.875ZM-10.5-3.5h.438a.878.878,0,0,0,.875-.875v-3.5a.878.878,0,0,0-.875-.875H-10.5Zm7.875-7a.878.878,0,0,1,.875.875.878.878,0,0,1-.875.875h-1.75V-7h1.75a.878.878,0,0,1,.875.875.878.878,0,0,1-.875.875h-1.75v2.625a.878.878,0,0,1-.875.875.878.878,0,0,1-.875-.875v-7A.878.878,0,0,1-5.25-10.5Z"
                transform="translate(21 24.5)"
                fill="#0075C9"
              />
            </svg>
          </span>
        </a>
      </div>

      <header>
        <h3 className="scientific-title">
          <a href={doc.descarga.href} target="_blank" rel="noreferrer">
            {doc.titulo}
          </a>
        </h3>
      </header>

      {/* `<strong>{autores}</strong> | {anyo}` + el término. El `<strong>` está
          en las 23 y `etiquetas` del barrido lo lee.

          ⚠ **El `{" "}` detrás del año NO es formato: es contenido servido.**
          El original escribe `| 2026` y un salto de línea antes del
          `<div class="scientific-category">`, y ese salto **colapsa a UN
          espacio** en el texto del nodo. Sin él, `meta.texto` daba
          «…| 2026Artículos técnicos» — 6 pares de eje `contenido` en las dos
          instancias, cazados por el comparador contra el corpus. Es §*el espacio
          en blanco entre elementos: el navegador lo renderiza*, aquí sobre el
          TEXTO en vez de sobre la geometría. */}
      <div className="scientific-taxonomies">
        <strong>{doc.autores}</strong> | {doc.anyo}{" "}
        <div className="scientific-category">
          <a href={hrefTermino} rel="tag">
            {doc.categoria.nombre}
          </a>
        </div>
      </div>

      <div className="scientific-excerpt">
        {extracto.texto}
        {extracto.recortado ? "... " : " "}
        <a href={hrefDocumento}>Seguir leyendo</a>
      </div>
    </article>
  );
}
