import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HeaderNav } from "@/components/HeaderNav";
import { BANDA, BandaCabecera } from "@/components/BandaCabecera";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import {
  AutoriaA,
  ColumnaLateralA,
  ColumnaPrincipalA,
  FilaA,
  MigasA,
  SeccionCuerpoA,
  TituloA,
} from "@/components/arquetipo-a/CascaronA";
import { CuerpoRicoA } from "@/components/arquetipo-a/CuerpoRicoA";
import { IndiceArticulo } from "@/components/arquetipo-a/IndiceArticulo";
import { PREFIJO_DOC_DEFECTO, rutaDocumento } from "@/lib/arquetipo-a";
// F2-3: el catálogo se lee del CMS por Local API; `src/lib/arquetipo-a.ts` se
// conserva como seed histórico y sigue aportando los helpers de RUTA, que son
// plantilla y no dato (`rutaDocumento`, `PREFIJO_DOC_DEFECTO`).
import { documentosCientificos } from "@/lib/cms/arquetipo-a";

/**
 * `/recursos/[...ruta]` — DOCUMENTO CIENTÍFICO, la tercera plantilla del
 * arquetipo A y la única de las tres con prefijo de ruta (23 páginas).
 *
 * ── ⚠ No es UN prefijo: son TRES, y el recon decía uno ────────────────────
 * `ENRUTADO.md` §1 dejó escrito «solo los 23 documentos científicos tienen
 * prefijo propio», en singular. Medido sobre las 23 URLs del censo:
 *
 * | prefijo | páginas |
 * |---|---|
 * | `recursos/documentos-cientificos/articulos-cientificos-y-estudios` | 14 |
 * | `recursos/documentos-cientificos/evaluaciones-independientes` | 8 |
 * | `recursos/estudios-cientificos/articulos-tecnicos` | **1** |
 *
 * O sea que la ruta es `recursos/<prefijo>/<categoría>/<slug>` con **dos**
 * valores de prefijo y **tres** de categoría — y la categoría es el término de
 * `scientific-category` que LH-2 ya había censado (3 términos).
 *
 * No contradice ninguna decisión: sigue sin tocar el plano del §4, y el
 * prefijo se modela **como CMS-1 modeló el del caso de éxito** —campo con
 * defecto, omitido cuando coincide—, que es el precedente exacto. Lo que sí
 * hace es corregir un número del recon, y por eso se dice en voz alta y va al
 * ESQUEMA en esta misma tanda.
 *
 * ── Por qué un catch-all y no `[categoria]/[slug]` ────────────────────────
 * Un segmento fijo `documentos-cientificos` dejaría fuera al de
 * `estudios-cientificos` — 1 de 23, que es exactamente la instancia que un
 * modelo escrito con la mayoría se come. Con `[...ruta]` y
 * `dynamicParams = false` la ruta emitida es la que declare el catálogo y nada
 * más: las demás dan 404, y las estáticas hermanas de `/recursos/` que se
 * construyan mañana ganan igual (una ruta estática gana a una dinámica del
 * mismo nivel — medido en el andamio del ENRUTADO).
 */
export const dynamicParams = false;

const porRuta = async (segmentos: string[]) => {
  const ruta = "/recursos/" + segmentos.join("/");
  return (await documentosCientificos()).find((d) => rutaDocumento(d) === ruta);
};

export async function generateStaticParams() {
  return (await documentosCientificos()).map((d) => ({
    ruta: [d.prefijo ?? PREFIJO_DOC_DEFECTO, d.categoria.slug, d.slug],
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ruta: string[] }>;
}): Promise<Metadata> {
  const { ruta } = await params;
  const doc = await porRuta(ruta);
  if (!doc) return {};
  return {
    title: doc.seo.title,
    // ⚠ `description` está **ausente en los 23**, igual que en las 19 FAQ. No
    // se fabrica: la corrección §0 de `grupo-C/DECISIONES.md` vale también aquí.
    alternates: { canonical: `https://kunakair.com/es${rutaDocumento(doc)}/` },
    ...(doc.seo.ogImage ? { openGraph: { images: [doc.seo.ogImage] } } : {}),
  };
}

export default async function PaginaDocumento({
  params,
}: {
  params: Promise<{ ruta: string[] }>;
}) {
  const { ruta } = await params;
  const doc = await porRuta(ruta);
  if (!doc) notFound();

  const O = "https://kunakair.com/es";
  const migas = [
    { label: "Inicio", href: "/" }, // ruta local: esta página ya está clonada (src/app/page.tsx)
    { label: "Recursos", href: `${O}/recursos/` },
    { label: "Documentos científicos", href: `${O}/recursos/documentos-cientificos/` },
    { label: doc.categoria.nombre, href: `${O}/scientific-category/${doc.categoria.slug}/` },
    { label: doc.titulo },
  ];

  return (
    <>
      <HeaderNav />

      <main className="flex flex-1 flex-col">
        <BandaCabecera {...BANDA.grupoA} />
        <MigasA migas={migas} />

        <SeccionCuerpoA>
          {/* `row#1` — titular y referencia. `pb 28.8` a 1440. */}
          <FilaA className="pb-[30px] min-[981px]:pb-[28.8px]">
            <div className="min-[981px]:flex">
              <ColumnaPrincipalA className="mb-[30px] min-[981px]:mb-0">
                <TituloA>{doc.titulo}</TituloA>
                {/* `text#2`, que el modelo del recon **no tenía**: autores, año
                    y categoría. Son campos — varían instancia a instancia. */}
                <div className="scientific-taxonomies text-[16px] leading-[30.6px] text-[#333]">
                  <strong>{doc.autores}</strong> | {doc.anyo}
                  <div className="scientific-category">
                    <a
                      href={`${O}/scientific-category/${doc.categoria.slug}/`}
                      className="text-[#0075C9] hover:underline"
                    >
                      {doc.categoria.nombre}
                    </a>
                  </div>
                </div>
              </ColumnaPrincipalA>
              <ColumnaLateralA />
            </div>
          </FilaA>

          {/* `row#2` — cuerpo a la izquierda; portada, descarga e índice a la
              derecha. `pt 14.39 · pb 28.8` a 1440. */}
          <FilaA className="pt-[3.89px] pb-[30px] min-[981px]:pt-[14.39px] min-[981px]:pb-[28.8px]">
            <div className="min-[981px]:flex">
              <ColumnaPrincipalA className="mb-[30px] min-[981px]:mb-0">
                <AutoriaA donde="principal" />
                <IndiceArticulo cuerpo={doc.cuerpo} donde="principal" />
                {/* `post_content mb 0` en los 6 documentos medidos. */}
                <CuerpoRicoA cuerpo={doc.cuerpo} />
              </ColumnaPrincipalA>

              <ColumnaLateralA>
                <div className="mb-[30px] min-[981px]:mb-[34.05px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={doc.portada.src}
                    srcSet={doc.portada.srcset}
                    sizes={doc.portada.sizes}
                    width={doc.portada.width}
                    height={doc.portada.height}
                    alt={doc.portada.alt ?? ""}
                    className="h-auto w-full"
                  />
                </div>
                <div className="mb-[30px] text-center min-[981px]:mb-[34.05px]">
                  {/* El rótulo dice **«View document», en inglés, en la web
                      española**. Va verbatim: la regla 1 del proyecto conserva
                      las erratas del original. */}
                  <a
                    href={doc.descarga.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-[3px] bg-[#0075C9] pt-[7.5px] pr-[22.5px] pb-[9px] pl-[40.5px] text-[15px] font-bold leading-[25.5px] text-white transition-opacity hover:opacity-80"
                  >
                    {doc.descarga.label}
                  </a>
                </div>
                <IndiceArticulo cuerpo={doc.cuerpo} donde="lateral" />
              </ColumnaLateralA>
            </div>
          </FilaA>
        </SeccionCuerpoA>
      </main>

      <Footer tipo="grupoA" />
      <ScrollToTop />
    </>
  );
}
