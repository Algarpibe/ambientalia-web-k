import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TarjetaListado } from "@/components/listados/TarjetaListado";
import { ModuloTexto } from "@/components/listados/ListadoB";
import { PaginaListado, Paginador } from "@/components/listados/PaginaListado";
import { entradasDeBlog, fechaLarga, pagina } from "@/lib/cms/listados";

/**
 * `L1-blog` — `/blog` y `/blog/page/N`.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LO QUE ESTA VARIANTE TIENE Y LA OTRA NO
 *
 * · el listado va dentro de un módulo de **TEXTO** (`et_pb_text_2_tb_body
 *   shotcode-listar-entradas-blog`), no de un módulo `et_pb_blog`. Eso no es un
 *   detalle: la clase `shotcode-listar-entradas-blog` es la que el CSS servido
 *   usa para darle `min-width: 440px` a la imagen de la tarjeta, y es la causa
 *   medida de que su media dé **440** dentro de una tarjeta de 277.2;
 * · el paginador va **dentro del mismo módulo**, detrás de `.et_pb_posts`;
 * · piel **A** (`role="pagination"`), sin `span.pages`;
 * · el `h1` vive en `et_pb_text_1_tb_body titulo-puntos` y su texto es un campo
 *   de la PÁGINA («Blog»), no el nombre de un término — `D4a`, 48 documentos de
 *   índice lo llevan así.
 *
 * ⚠ **`SP-B3`: esta forma tiene n = 1 en el original**, así que todo lo suyo
 * está SIN PROBAR —no se ha podido medir su varianza entre instancias—. Lo que
 * aquí se reproduce es lo medido en esa única instancia.
 */

/** El discriminador del listado: 149 − 81 con `recurso` = **68**. */
export async function paginasDeBlog() {
  const todas = await entradasDeBlog();
  return Math.max(1, Math.ceil(todas.length / 9));
}

const ruta = (n: number) => (n === 1 ? "/blog" : `/blog/page/${n}`);

export async function metadataBlog(n: number): Promise<Metadata> {
  /* El `<title>` de Yoast nombra la página: «Página 9 de 17» en las vacías.
     Se replica el patrón medido, que es lo que `D2.5` obliga a servir. */
  const total = await paginasDeBlog();
  return {
    title: n === 1 ? "Blog - Kunak" : `Blog - Página ${n} de ${total} - Kunak`,
    /* Canónica **a sí misma**, incluidas las vacías: `D2.4`, medido 7/7 y 55/55. */
    alternates: { canonical: `https://kunakair.com/es${n === 1 ? "/blog/" : `/blog/page/${n}/`}` },
  };
}

export async function PaginaBlog({ n }: { n: number }) {
  if (!Number.isInteger(n) || n < 1) notFound();
  const todas = await entradasDeBlog();
  const p = pagina(todas, n);

  return (
    <PaginaListado
      variante="blog"
      /* El original lo sirve en absoluto y apuntando a sí mismo; el clon usa su
         ruta local, que es la que emite. */
      hrefSiguiente={p.n < p.total ? ruta(p.n + 1) : undefined}
      miga={[{ label: "Inicio", href: "/" }, { label: "Blog" }]}
      titular={
        <ModuloTexto n={1} extra="titulo-puntos">
          <h1>Blog</h1>
        </ModuloTexto>
      }
      listado={
        <ModuloTexto n={2} extra="shotcode-listar-entradas-blog">
          <div className="et_pb_posts">
            <div>
              {p.items.map((e, i) => (
                <TarjetaListado
                  key={e.slug}
                  entrada={e}
                  variante="blog"
                  indice={i}
                  fecha={fechaLarga(e.fechaPublicacion)}
                  /* `/blog` usa el extracto **manual** donde existe y el
                     automático si no — LH-SP10, es CAMPO. Sembrado 66 de 68. */
                  extracto={e.extracto}
                  /* ruta local: las 149 entradas ya están clonadas en `/[slug]`.
                     href original: `https://kunakair.com/es/<slug>/` */
                  hrefEntrada={`/${e.slug}`}
                  /* `/categoria/<slug>/` NO está clonado (F3-4): se queda en el
                     original hasta que se clone. */
                  hrefCategoria={`https://kunakair.com/es/categoria/${e.categorias[0]?.slug ?? ""}/`}
                />
              ))}
            </div>
          </div>
          {/* El paginador de blog va DENTRO de este módulo, detrás del listado. */}
          <Paginador piel="A" n={p.n} total={p.total} href={ruta} />
        </ModuloTexto>
      }
    />
  );
}
