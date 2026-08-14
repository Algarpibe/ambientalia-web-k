import type { EntradaBlog } from "@/types/kunak";

/**
 * LA TARJETA DE `LISTADO-B` — dos variantes, un componente.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LO QUE DIFIERE ENTRE BLOG Y ETIQUETA, MEDIDO
 *
 * | | `L1-blog` | `L1-etiqueta` |
 * |---|---|---|
 * | media | la 1.ª **no tiene** (ese post no trae destacada) | sí, 277.2 × 187.11 |
 * | titular | `h2` **23 px / 28.75** | `h2` **20 px / 27** |
 * | fecha | «24 de febrero de 2026», **sin** `.published` | `<span class="published">May 25, 2026</span>` |
 * | categoría | `rel="category tag"` + clase del slug | `rel="tag"`, sin clase |
 * | extracto | **campo** (86–401 c) | **derivado** (256–271 c + «...») |
 * | envoltorio del extracto | `.post-content > p` | `.post-content > .post-content-inner > p` |
 *
 * Las dos primeras son piel y viven en `listados.css`; las cuatro últimas son
 * MARCADO y viven aquí, porque el barrido las lee por rol y **el selector que
 * casa es parte de lo que compara** (`sel` es eje `plantilla`).
 *
 * ⚠ **La piel de la tarjeta de `/blog` está SIN PROBAR y hay que decirlo**
 * (`SP-B3`): `L1-blog` tiene **n = 1** —una sola instancia en el original—, así
 * que su varianza no se ha medido. Lo que aquí se reproduce es lo medido en esa
 * instancia, no una regla verificada entre hermanas.
 *
 * ── El zoom NO se implementa aquí ─────────────────────────────────────────
 * Es una regla de CSS con disparador nombrado
 * (`.et_pb_post .entry-featured-image-url:hover img`), leída del CSS servido por
 * `qa:hover-zonal` sobre 41 185 reglas. El disparador es **el `<a>` de la
 * imagen, nunca el `article`**, y por eso vive en la hoja y no en una clase de
 * este componente.
 */

/* ══════════════════════════════════════════════════════════════════════════
 * LAS CLASES DE `post_class()`
 *
 * WordPress las emite y el barrido las lee (`clases`, eje **mixta**: mezclan el
 * tema con el dato — `post-68584`, `category-*`, `tag-*`). Se reproducen porque
 * son parte de la salida servida y porque `has-post-thumbnail` es el
 * discriminador que el propio tema usa.
 *
 * ⚠ **`post-<ID>` NO se puede reproducir**, y se dice en vez de inventarlo: el
 * ID numérico de WordPress no está en el modelo —no se midió, no se sembró y no
 * tiene por qué existir en el CMS de destino—. Su ausencia sale como diferencia
 * de eje **mixta**, que es el cubo declarado *sin referencia limpia*, así que no
 * se lee como defecto. Poner un número inventado sí sería un defecto: haría
 * pasar por dato algo que nadie midió.
 * ═════════════════════════════════════════════════════════════════════════ */
function clasesDePost(e: EntradaBlog, extra: string[]): string {
  return [
    "et_pb_post",
    "clearfix",
    ...extra,
    "post",
    "type-post",
    "status-publish",
    "format-standard",
    ...(e.imagenDestacada ? ["has-post-thumbnail"] : []),
    "hentry",
    ...e.categorias.map((c) => `category-${c.slug}`),
    ...(e.etiquetas ?? []).map((t) => `tag-${t.slug}`),
    ...(e.recurso ? [`resources-${e.recurso.slug}`] : []),
  ].join(" ");
}

export type VarianteTarjeta = "blog" | "etiqueta";

export function TarjetaListado({
  entrada,
  variante,
  fecha,
  extracto,
  hrefEntrada,
  hrefCategoria,
  indice,
}: {
  entrada: EntradaBlog;
  variante: VarianteTarjeta;
  /** Ya formateada por la variante: `fechaLarga` o `fechaCorta`. */
  fecha: string;
  /** Ya resuelto por la variante: el campo en blog, el derivado en etiqueta. */
  extracto?: string;
  hrefEntrada: string;
  hrefCategoria: string;
  /** Posición en la página — Divi la compila en `et_pb_blog_item_1_<i>`. */
  indice: number;
}) {
  const esEtiqueta = variante === "etiqueta";
  const cat = entrada.categorias[0];

  const media = entrada.imagenDestacada ? (
    <a href={hrefEntrada} className="entry-featured-image-url">
      {/* eslint-disable-next-line @next/next/no-img-element -- el original sirve
          un `<img>` de WordPress con su `srcset`; `next/image` metería su propio
          envoltorio y su propio `sizes`, que es justo lo que aquí se compara. */}
      <img
        src={entrada.imagenDestacada.src}
        {...(entrada.imagenDestacada.srcset ? { srcSet: entrada.imagenDestacada.srcset } : {})}
        {...(entrada.imagenDestacada.sizes ? { sizes: entrada.imagenDestacada.sizes } : {})}
        {...(entrada.imagenDestacada.width ? { width: entrada.imagenDestacada.width } : {})}
        {...(entrada.imagenDestacada.height ? { height: entrada.imagenDestacada.height } : {})}
        /* ⚠ **El `alt` sale de sitios DISTINTOS en las dos variantes, y eso está
           medido, no elegido.** El módulo `et_pb_blog` de `/etiqueta` pinta el
           TITULAR del post; el shortcode de `/blog` pinta el `alt` propio del
           adjunto. Se ve en las 6 tarjetas de etiqueta comparadas —«Sargazo:
           problemas ambientales…» contra «El sargazo cuando flota en el
           océano…»— y en 0 de las de blog.

           Es la clase de diferencia que sólo aparece con las dos variantes
           delante: con una sola instancia, cualquiera de las dos reglas cuadra. */
        alt={esEtiqueta ? entrada.titulo : (entrada.imagenDestacada.alt ?? "")}
        /* `P-LH-C6` midió `sinCargarAntes = 0` en las 9 formas: NO hace falta
           maquinaria de carga diferida para ser fiel. El atributo `loading` es
           markup y el original **sólo lo emite en L4** — ponerlo aquí sería
           estrenar un defecto que la medida ya descartó. */
        decoding="async"
        className={esEtiqueta ? "" : "attachment-large size-large wp-post-image"}
      />
    </a>
  ) : null;

  return (
    <article
      className={clasesDePost(entrada, esEtiqueta ? [`et_pb_blog_item_1_${indice}`] : [])}
    >
      {media}
      <h2 className="entry-title">
        <a href={hrefEntrada}>{entrada.titulo}</a>
      </h2>
      <p className="post-meta">
        {esEtiqueta ? <span className="published">{fecha}</span> : fecha}
        {" | "}
        {esEtiqueta ? (
          <a href={hrefCategoria} rel="tag">
            {cat?.nombre}
          </a>
        ) : (
          <a href={hrefCategoria} rel="category tag" className={cat?.slug}>
            {cat?.nombre}
          </a>
        )}
      </p>
      <div className="post-content">
        {esEtiqueta ? (
          <div className="post-content-inner">
            <p>{extracto}</p>
          </div>
        ) : (
          <p>{extracto}</p>
        )}
      </div>
    </article>
  );
}
