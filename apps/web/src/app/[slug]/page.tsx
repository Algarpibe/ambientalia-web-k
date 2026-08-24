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
import { RelacionadosA } from "@/components/arquetipo-a/RelacionadosA";
import {
  entradasBlog,
  getPaginaPlanaCms,
  terminosKunakpedia,
  type PaginaPlana,
} from "@/lib/cms/arquetipo-a";
import { PaginaF33, metadataF33 } from "@/components/cola-larga/PaginaF33";
import { enElPlanoDeRaiz, getPaginaColaLarga, paginasColaLarga } from "@/lib/cms/paginas";
import type { EntradaBlog } from "@/types/kunak";

/**
 * `/[slug]` — el PLANO DE RAÍZ de `/es/`, sirviendo **dos** formas del
 * arquetipo A: entrada de blog (149) y término de Kunakpedia (37).
 *
 * Recon `docs/research/arquetipo-A/`, enrutado `ENRUTADO.md` y
 * `ESQUEMA-CMS.md` §4, esquema §2. Es el mismo patrón que `/sectores/[slug]`
 * lleva usando para despachar SECTOR y MONOGRÁFICO: un solo segmento dinámico
 * contra dos catálogos.
 *
 * ── Por qué el plano y no un prefijo por familia ──────────────────────────
 * **187 de las 209 páginas de A cuelgan de la raíz de `/es/`**, junto con
 * `page`, `solutions` y los índices: **202 slugs en un plano**. Darles prefijo
 * (`/glosario/<slug>`) rompería 187 URLs vivas y sería la primera desviación
 * estructural del clon. Salida (a) de `ENRUTADO.md` §3, y la única ya probada
 * en este repo.
 *
 * ── `dynamicParams = false` NO es una formalidad ──────────────────────────
 * Sin esta línea, un `[slug]` de raíz **se traga todos los 404 de un
 * segmento**: `/slug-inventado` responde **200** con una página cualquiera, y
 * `/acesorios` con una errata deja de fallar. Medido en el andamio del
 * ENRUTADO (resultado 3). Es la línea que le devuelve los 404 al sitio.
 *
 * ⚠ Y era **A-SP12: deducido, no medido**. Esta construcción lo mide — se
 * comprueba con una petición a una ruta inventada en el PASO 4.
 *
 * ── La colisión de slugs la vigila una guarda, porque el build no avisa ───
 * Un slug de blog que choque con `/accesorios` **compila sin error** y sirve la
 * página equivocada con HTTP 200. `npm run qa:slugs` lo caza y entra en
 * `npm run check`.
 */
export const dynamicParams = false;

/**
 * ── LA FUENTE DEL DATO ES EL CMS desde el 2026-08-06 (F2-3) ───────────────
 * El despacho vive en `lib/cms/arquetipo-a.ts` porque necesita los catálogos, y
 * tenerlo en un sitio evita que `generateStaticParams`, `generateMetadata` y el
 * componente consulten por tres caminos.
 *
 * ⚠ **Y esta familia es la ÚNICA que no puede pagar un Δ0 de ruta**, porque su
 * dato pasa por T4b y T4b **sustituye, no restaura**. El criterio con el que se
 * acepta —resto a umbral cero, bloque contra la diana de su clase— está en
 * `PENDIENTES-QA.md` §F2-3-T4B-CRITERIO y lo mide `npm run qa:t4b-bloque`.
 */
type Pagina = PaginaPlana;

/**
 * ⚠⚠ **DESDE F3-3 (E1) ESTE PLANO DESPACHA TRES CATÁLOGOS, NO DOS.**
 *
 * Los dos de siempre —blog (149) y término (37)— más **19 de la COLA LARGA**:
 * las que no tienen `prefijo`, o sea las de un solo segmento. El predicado es
 * `enElPlanoDeRaiz`, y **se escribe una vez**: la colección usa el MISMO para
 * decidir si reclama el slug (`enElPlano: (doc) => !doc.prefijo`). Dos
 * definiciones de «está en el plano» serían la clase C7, y la que decide la
 * unicidad y la que decide la ruta tienen que ser la misma o **la guarda vigila
 * un conjunto y el build emite otro** (§regla 25).
 *
 * La unicidad ENTRE familias la impone `npm run qa:slugs`, que deriva sus
 * familias del registro — así que `paginas` entra sola. Sin esa guarda una
 * colisión **no da error**: el build compila, emite la ruta por las dos vías y
 * sirve la página equivocada con HTTP 200 (medido tres veces).
 */
export async function generateStaticParams() {
  const [blog, terminos, cola] = await Promise.all([
    entradasBlog(),
    terminosKunakpedia(),
    paginasColaLarga(),
  ]);
  return [
    ...blog.map((e) => ({ slug: e.slug })),
    ...terminos.map((e) => ({ slug: e.slug })),
    ...cola.filter(enElPlanoDeRaiz).map((p) => ({ slug: p.slug })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  /* La cola larga primero: son catálogos DISJUNTOS —lo garantiza `qa:slugs`—
   * así que el orden no decide nada; se pregunta por el más pequeño antes. */
  if (await getPaginaColaLarga([slug])) return metadataF33([slug]);
  const p = await getPaginaPlanaCms(slug);
  if (!p) return {};
  const { seo } = p.datos;
  return {
    title: seo.title,
    ...(seo.description ? { description: seo.description } : {}),
    // El `canonical` se DERIVA de la ruta y apunta al original, como en el
    // resto del clon: declara cuál es la página buena para los buscadores.
    alternates: { canonical: `https://kunakair.com/es/${slug}/` },
    ...(seo.ogImage ? { openGraph: { images: [seo.ogImage] } } : {}),
  };
}

/**
 * Las migas. **Derivadas, no almacenadas**: la forma la decide la relación con
 * la taxonomía, no un campo de texto.
 *
 * - término → `Inicio › Recursos › Kunakpedia › título`, constante en los 3
 *   medidos;
 * - blog **con** `recurso` → `Inicio › Recursos › Artículos y Guías › <hija> ›
 *   título` (6 de 7);
 * - blog **sin** `recurso` → `Inicio › Blog › título` (1 de 7).
 *
 * `Inicio` va a la ruta local —ya está clonada—; `Recursos`, `Blog` y los
 * archivos de taxonomía siguen apuntando al original, que es lo que la regla de
 * rutas locales pide mientras no estén clonados.
 */
function migasDe(p: Pagina) {
  const O = "https://kunakair.com/es";
  const base = [
    { label: "Inicio", href: "/" }, // ruta local: esta página ya está clonada (src/app/page.tsx)
    { label: "Recursos", href: `${O}/recursos/` },
  ];
  if (p.forma === "termino")
    // ⚠ El rótulo de la miga **no es el `h1`** en esta forma (3 de 3 medidos):
    // es el nombre corto del término. Campo opcional con defecto «el título».
    return [
      ...base,
      { label: "Kunakpedia", href: `${O}/recursos/kunakpedia/` },
      { label: p.datos.tituloMiga ?? p.datos.titulo },
    ];
  const { recurso, titulo } = p.datos;
  if (!recurso)
    return [
      { label: "Inicio", href: "/" },
      { label: "Blog", href: `${O}/blog/` },
      { label: titulo },
    ];
  return [
    ...base,
    { label: "Artículos y Guías", href: `${O}/recursos/articulos/` },
    { label: recurso.nombre, href: `${O}/recursos/articulos/${recurso.slug}/` },
    { label: titulo },
  ];
}

/**
 * Las taxonomías del pie del titular. El singular/plural **se deriva del
 * número**, igual que el `Sector(es):` del caso de éxito — un solo valor en el
 * corpus, o sea plantilla.
 */
function Taxonomias({ entrada }: { entrada: EntradaBlog }) {
  const O = "https://kunakair.com/es";
  const enlace = (base: string, t: { slug: string; nombre: string }, i: number, n: number) => (
    <span key={t.slug}>
      <a href={`${O}/${base}/${t.slug}/`} className="hover:underline">
        {t.nombre}
      </a>
      {i < n - 1 ? ", " : ""}
    </span>
  );
  return (
    <div className="case-taxonomies text-[18px] leading-[30.6px] text-[#333]">
      {entrada.categorias.length > 0 && (
        <span className="case-categorias">
          <span>{entrada.categorias.length > 1 ? "Categorías: " : "Categoría: "}</span>
          {entrada.categorias.map((t, i) => enlace("categoria", t, i, entrada.categorias.length))}
        </span>
      )}
      {entrada.etiquetas.length > 0 && (
        <span className="case-tags">
          <span>{entrada.etiquetas.length > 1 ? "Etiquetas: " : "Etiqueta: "}</span>
          {entrada.etiquetas.map((t, i) => enlace("etiqueta", t, i, entrada.etiquetas.length))}
        </span>
      )}
    </div>
  );
}

export default async function PaginaPlana({
  params,
  conBorradores = false,
}: {
  params: Promise<{ slug: string }>;
  /**
   * ⚠ **Prop que Next NUNCA pasa — F2-4.** Next entrega `params` y
   * `searchParams` y nada más, así que en la ruta estática vale siempre `false`
   * y el artefacto no cambia (Δ0 medido en las 31 rutas).
   *
   * Existe para que **la vista previa REUSE esta página en vez de copiarla**.
   * Una segunda copia del árbol de un arquetipo es la peor forma de preview que
   * hay: enseña algo que se *parece* a la página, y la divergencia aparece el
   * día que alguien toca una sola de las dos — sin que nada lo diga.
   */
  conBorradores?: boolean;
}) {
  const { slug } = await params;
  /* TERCER CATÁLOGO (E1). Su árbol vive en `PaginaF33` y **no se copia aquí**:
   * el arquetipo tiene cinco planos de ruta y cinco copias del mismo árbol es
   * la peor forma de duplicación que hay. */
  if (await getPaginaColaLarga([slug], { conBorradores }))
    return <PaginaF33 segmentos={[slug]} conBorradores={conBorradores} />;

  const p = await getPaginaPlanaCms(slug, { conBorradores });
  if (!p) notFound();

  const esBlog = p.forma === "blog";
  const { cuerpo, titulo } = p.datos;
  /* El catálogo de `RelacionadosA` se espera AQUÍ y baja por prop: un `await`
   * dentro del hijo cambia el HTML servido sin mover un dato (§F2-3-ASYNC-HIJO,
   * medido: 2 rutas con Δ 0 bytes y el marcado distinto). Sólo se pide cuando la
   * sección existe, para no consultar de más en las formas que no la llevan. */
  const catalogoRelacionados = esBlog && p.datos.relacionados ? await entradasBlog() : [];

  return (
    <>
      <HeaderNav />

      <main className="flex flex-1 flex-col">
        {/* La banda del hueco de la cabecera (C-QA1). **225 / 165.58**, medidos
            por composición sobre la `y` cruda del `h1` del original:
            332.59 − 50 (section#0) − 57.59 (section#1 pt) = 225 a 1440, y
            317.58 − 102 − 50 = 165.58 a 390. Coinciden con los de la FAQ en los
            dos anchos —no en uno solo, que es lo que el ⚠ de `BandaCabecera`
            avisa que no basta—, así que se reusa su entrada. */}
        <BandaCabecera {...BANDA.grupoA} />

        <MigasA migas={migasDe(p)} />

        <SeccionCuerpoA>
          {esBlog ? (
            <>
              {/* `row#1` — titular, fecha y taxonomías. `pb 28.8` a 1440 y 30 a
                  390, con la columna apilada añadiendo `mb 30`. */}
              <FilaA className="pb-[30px] min-[981px]:pb-[28.8px]">
                <div className="min-[981px]:flex">
                  <ColumnaPrincipalA className="mb-[30px] min-[981px]:mb-0">
                    <TituloA>{titulo}</TituloA>
                    <div className="mb-[30px] text-[16px] leading-[30.6px] text-[#7F8798] min-[981px]:mb-[34.05px]">
                      <span className="fecha-publicacion">{p.datos.fechaPublicacion}</span>
                      {p.datos.fechaActualizacion && (
                        <>
                          {" - "}
                          <span className="fecha-actualizacion">
                            Actualizado {p.datos.fechaActualizacion}
                          </span>
                        </>
                      )}
                    </div>
                    <Taxonomias entrada={p.datos} />
                  </ColumnaPrincipalA>
                  {/* `column#2`: vacía en el original (h 1 a 1440, 0 a 390). */}
                  <ColumnaLateralA />
                </div>
              </FilaA>

              {/* `row#2` — `pt 14.39 · pb 28.8` a 1440; `3.89 / 30` a 390. */}
              <FilaA className="pt-[3.89px] pb-[30px] min-[981px]:pt-[14.39px] min-[981px]:pb-[28.8px]">
                <div className="min-[981px]:flex">
                  <ColumnaPrincipalA className="mb-[30px] min-[981px]:mb-0">
                    {p.datos.imagenDestacada && (
                      <div className="mb-[30px] min-[981px]:mb-[34.05px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.datos.imagenDestacada.src}
                          srcSet={p.datos.imagenDestacada.srcset}
                          sizes={p.datos.imagenDestacada.sizes}
                          width={p.datos.imagenDestacada.width}
                          height={p.datos.imagenDestacada.height}
                          alt={p.datos.imagenDestacada.alt ?? ""}
                          className="h-auto w-full"
                        />
                      </div>
                    )}
                    <AutoriaA donde="principal" />
                    <IndiceArticulo cuerpo={cuerpo} donde="principal" />
                    {/* `post_content mb 72` — el valor que distingue la
                        plantilla de blog de las otras dos (0 en ambas). */}
                    <CuerpoRicoA cuerpo={cuerpo} className="mb-[72px]" />
                  </ColumnaPrincipalA>
                  <ColumnaLateralA>
                    <AutoriaA donde="lateral" />
                    <IndiceArticulo cuerpo={cuerpo} donde="lateral" />
                  </ColumnaLateralA>
                </div>
              </FilaA>
            </>
          ) : (
            /* TÉRMINO — la forma más plana: **no tiene `row#2`**. Todo cuelga de
               `row#1`, con `pt 14.39 · pb 28.8`. Y su `h1` **no reduce a 390**:
               44 / 52.8 a los dos anchos, con `mb 44`. */
            <FilaA className="pt-[3.89px] pb-[30px] min-[981px]:pt-[14.39px] min-[981px]:pb-[28.8px]">
              <div className="min-[981px]:flex">
                <ColumnaPrincipalA className="mb-[30px] min-[981px]:mb-0">
                  <TituloA responsive={false} className="mb-[44px]">
                    {titulo}
                  </TituloA>
                  <IndiceArticulo cuerpo={cuerpo} donde="principal" />
                  {/* `post_content mb 0` en las 6 instancias de término. */}
                  <CuerpoRicoA cuerpo={cuerpo} />
                </ColumnaPrincipalA>
                <ColumnaLateralA>
                  <IndiceArticulo cuerpo={cuerpo} donde="lateral" />
                </ColumnaLateralA>
              </div>
            </FilaA>
          )}
        </SeccionCuerpoA>

        {/* `section#2` — solo en 83 de las 149 entradas de blog, y no se sabe
            qué lo decide (A-SP1/A-SP2). Hasta saberlo es un campo. */}
        {esBlog && p.datos.relacionados && (
          <RelacionadosA excluir={slug} catalogo={catalogoRelacionados} />
        )}
      </main>

      <Footer tipo="grupoA" />
      <ScrollToTop />
    </>
  );
}
