import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ModuloTexto } from "@/components/listados/ListadoB";
import { ModuloPaginador, PaginaListado, Paginador } from "@/components/listados/PaginaListado";
import { TarjetaListado } from "@/components/listados/TarjetaListado";
import {
  entradasDeEtiqueta,
  etiquetasA,
  extractoDerivado,
  fechaCorta,
  pagina,
} from "@/lib/cms/listados";

/**
 * `L1-etiqueta` — `/etiqueta/<slug>` y `/etiqueta/<slug>/page/N`.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LO QUE ESTA VARIANTE TIENE Y LA OTRA NO
 *
 * · el listado es un módulo `et_pb_blog_1_tb_body et_pb_posts` de verdad, con
 *   `.et_pb_ajax_pagination_container` dentro. Su override de módulo baja el
 *   titular de la tarjeta a **20 px / 1.35em** con `!important` — que es cómo
 *   Divi compila lo que el editor tocó;
 * · el paginador va en un módulo APARTE (`et_pb_text_6_tb_body`), piel **B**
 *   (`role="navigation"`), y **imprime el total** en `span.pages`;
 * · el `h1` va precedido de tres `span.tax-tap` —uno por idioma, con
 *   `ocultar-*`— y el texto sale del **NOMBRE del término**, no de su slug:
 *   `D4a`, medido en 89 documentos de archivo, y los separan 4 casos;
 * · trae un módulo de **descripción** (`et_pb_text_4_tb_body`) con ancho propio
 *   —941.17 de 1238.39, o sea 76 %—. Es campo: **varía entre instancias**, y el
 *   extractor lo confirma en 12 de 12;
 * · la fecha se pinta en `<span class="published">` con el formato corto
 *   («May 25, 2026»), que es el `.published` del módulo de Divi;
 * · el extracto **NO es el campo**: se DERIVA truncando el cuerpo (LH-SP10).
 */

const ruta = (slug: string) => (n: number) =>
  n === 1 ? `/etiqueta/${slug}` : `/etiqueta/${slug}/page/${n}`;

/** Los params de las etiquetas, derivados del catálogo. */
export async function paramsEtiquetas() {
  return (await etiquetasA()).map((t) => ({ slug: t.slug }));
}

export async function metadataEtiqueta(slug: string, n: number): Promise<Metadata> {
  const t = (await etiquetasA()).find((x) => x.slug === slug);
  if (!t) return {};
  const total = Math.max(1, Math.ceil((await entradasDeEtiqueta(slug)).length / 9));
  return {
    title: n === 1 ? `${t.nombre} - Kunak` : `${t.nombre} - Página ${n} de ${total} - Kunak`,
    alternates: {
      canonical: `https://kunakair.com/es/etiqueta/${slug}/${n === 1 ? "" : `page/${n}/`}`,
    },
  };
}

export async function PaginaEtiqueta({ slug, n }: { slug: string; n: number }) {
  if (!Number.isInteger(n) || n < 1) notFound();
  const t = (await etiquetasA()).find((x) => x.slug === slug);
  if (!t) notFound();

  const todas = await entradasDeEtiqueta(slug);
  const p = pagina(todas, n);

  return (
    <PaginaListado
      variante="etiqueta"
      miga={[
        { label: "Inicio", href: "/" },
        // ruta local: `/blog` la emite esta misma tanda.
        // href original: `https://kunakair.com/es/blog/`
        { label: "Blog", href: "/blog" },
        { label: t.nombre },
      ]}
      titular={
        <ModuloTexto n={3}>
          {/* Los tres rótulos por idioma, verbatim. `ocultar-*` los esconde
              según la locale: es marcado del original y va tal cual. */}
          <span className="tax-tap tax-tap-tag ocultar-en">Tag</span>
          <span className="tax-tap tax-tap-tag ocultar-es">Etiqueta</span>
          <span className="tax-tap tax-tap-tag ocultar-fr">Étiquette</span>{" "}
          <h1>{t.nombre}</h1>
        </ModuloTexto>
      }
      descripcion={
        t.descripcion ? (
          <ModuloTexto n={4}>
            {/* Campo RICO: el censo del marcado de las 12 descripciones da `p`,
                `br` y `a`. Guardarlo como texto plano tiraría los enlaces. */}
            <div dangerouslySetInnerHTML={{ __html: t.descripcion }} />
          </ModuloTexto>
        ) : undefined
      }
      listado={
        <div className="et_pb_module et_pb_blog_1_tb_body et_pb_posts et_pb_bg_layout_light">
          <div className="et_pb_ajax_pagination_container">
            {p.items.map((e, i) => (
              <TarjetaListado
                key={e.slug}
                entrada={e}
                variante="etiqueta"
                indice={i}
                fecha={fechaCorta(e.fechaPublicacion)}
                /* DERIVADO, no el campo: `/etiqueta` ignora el extracto manual
                   —medido en las 15 que difieren— y trunca el cuerpo. */
                extracto={extractoDerivado(e.cuerpo)}
                /* ruta local: las 149 entradas ya están clonadas en `/[slug]`.
                   href original: `https://kunakair.com/es/<slug>/` */
                hrefEntrada={`/${e.slug}`}
                hrefCategoria={`https://kunakair.com/es/categoria/${e.categorias[0]?.slug ?? ""}/`}
              />
            ))}
          </div>
        </div>
      }
      paginador={
        <ModuloPaginador>
          <Paginador piel="B" n={p.n} total={p.total} href={ruta(slug)} />
        </ModuloPaginador>
      }
    />
  );
}
