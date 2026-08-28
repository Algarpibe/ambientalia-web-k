import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BandaFiltros, BotonTermino } from "@/components/listados/BandaFiltros";
import { PaginaTema } from "@/components/listados/PaginaTema";
import { TarjetaCientifica } from "@/components/listados/TarjetaCientifica";
import { rutaDocumento } from "@/lib/arquetipo-a";
import {
  categoriasCientificas,
  documentosDeCategoria,
  extractoCientifico,
  paginasDeCategoria,
  rutaCategoriaCientifica,
} from "@/lib/cms/documentos";

/**
 * `L3` — `/scientific-category/<término>` y `/scientific-category/<término>/page/<n>`.
 *
 * Spec: `docs/research/listados-hubs/components/listado-tema-tax.spec.md`.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ EL CUERPO **NO PAGINA**, Y ESO ES LO QUE MÁS CONDICIONA ESTA PLANTILLA
 *
 * Las 3 páginas de la serie canónica sirven **las 14** tarjetas —`nTarjetas`
 * 14·14·14 y `docH` **idéntico** en las tres, a los dos anchos— y **ninguna de
 * las 6 pinta paginador**. `/page/N` sólo se diferencia de la 1.ª en el
 * `<title>` («Página N de M») y en el `canonical`.
 *
 * O sea: **WordPress pagina la CONSULTA y la plantilla del tema pinta el
 * término entero**, ignorando el `paged`. Emitir una rebanada aquí sería
 * inventar un comportamiento que el original no tiene, y se vería en
 * `nTarjetas` y en `docH` a la vez.
 *
 * ⛔ **Y las rutas `/page/N` se emiten igualmente, aunque sean inalcanzables por
 * navegación** (§LH-C6-L3-SIN-PAGINADOR · `D2.6` REPLICAR TAL CUAL): el original
 * las sirve con 200 y con su canonical propio, y el único rastro de ellas en el
 * documento es el `<link rel=next>` de Yoast. Replicar es la decisión escrita;
 * no emitirlas sería la desviación.
 */
const TITULO_TAXONOMIA = "Documentos científicos";

/** El hub del que cuelga la miga. **NO está clonado** ⇒ se queda en el original. */
const HREF_HUB = "/recursos/documentos-cientificos";

type Params = { slug: string; n: number };

/** Las 6 rutas: una por página de cada término. Derivadas, no escritas. */
export async function paramsDeCategorias(): Promise<{ slug: string; total: number }[]> {
  const terminos = await categoriasCientificas();
  const out: { slug: string; total: number }[] = [];
  for (const t of terminos) {
    const docs = await documentosDeCategoria(t.slug);
    out.push({ slug: t.slug, total: paginasDeCategoria(docs.length) });
  }
  return out;
}

export async function metadataCategoria({ slug, n }: Params): Promise<Metadata> {
  const terminos = await categoriasCientificas();
  const t = terminos.find((x) => x.slug === slug);
  if (!t) return {};
  const docs = await documentosDeCategoria(slug);
  const total = paginasDeCategoria(docs.length);
  /* ⚠ «archivos» en plural y SIN tilde: es de WordPress, no una errata que
     corregir. Verbatim, como manda la regla 1 del proyecto. */
  const base = `${t.nombre} archivos`;
  return {
    title: n === 1 ? `${base} - Kunak` : `${base} - Página ${n} de ${total} - Kunak`,
    /* Canónica **a sí misma**, igual que en `L1` (`D2.4`). */
    alternates: {
      canonical: `https://kunakair.com/es/scientific-category/${slug}/${n === 1 ? "" : `page/${n}/`}`,
    },
  };
}

export async function PaginaCategoriaCientifica({ slug, n }: Params) {
  if (!Number.isInteger(n) || n < 1) notFound();
  const terminos = await categoriasCientificas();
  const t = terminos.find((x) => x.slug === slug);
  if (!t) notFound();

  const docs = await documentosDeCategoria(slug);
  const total = paginasDeCategoria(docs.length);
  if (n > total) notFound();

  return (
    <PaginaTema
      variante="sci"
      /* El `<link rel=next>`/`prev` que Yoast sirve. Es lo ÚNICO que esta forma
         emite de paginación, así que el rol existe aparte del control del
         cuerpo — que aquí no hay. */
      hrefSiguiente={n < total ? rutaCategoriaCientifica(slug, n + 1) : undefined}
      hrefAnterior={n > 1 ? rutaCategoriaCientifica(slug, n - 1) : undefined}
      miga={[
        { label: "Inicio", href: "/" },
        /* `/recursos/documentos-cientificos/` es un HUB y **no está clonado**
           (F3-3): el enlace se queda apuntando al original hasta que lo esté. */
        { label: "Documentos Científicos", href: HREF_HUB },
        { label: t.nombre },
      ]}
      sobretitulo={<span className="tax-tap tax-tap-category">{TITULO_TAXONOMIA}</span>}
      titulo={t.nombre}
      filtros={
        <BandaFiltros variante="sci">
          {terminos.map((x) => (
            <BotonTermino key={x.slug} href={rutaCategoriaCientifica(x.slug)} actual={x.slug === slug}>
              {x.nombre}
            </BotonTermino>
          ))}
        </BandaFiltros>
      }
      listado={
        <div className="scientific-list-content">
          {docs.map((d) => (
            <TarjetaCientifica
              key={d.slug}
              doc={d}
              extracto={extractoCientifico(d.cuerpo)}
              /* ruta local: las 23 están clonadas en `/recursos/…`. */
              hrefDocumento={rutaDocumento(d)}
              hrefTermino={rutaCategoriaCientifica(d.categoria.slug)}
            />
          ))}
        </div>
      }
    />
  );
}
