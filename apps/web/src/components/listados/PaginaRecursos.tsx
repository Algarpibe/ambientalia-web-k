import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ModuloTexto } from "@/components/listados/ListadoB";
import { PaginaListado, Paginador } from "@/components/listados/PaginaListado";
import { TarjetaListado } from "@/components/listados/TarjetaListado";
import type { CategoriaRecurso } from "@/types/kunak";
import {
  POR_PAGINA_RESOURCES,
  categoriasRecursos,
  entradasDeRecurso,
  fechaCorta,
  pagina,
  rutaRecurso,
} from "@/lib/cms/listados";

/**
 * `L1-resources` — la TERCERA variante de `LISTADO-B`, y la única jerárquica.
 * `/recursos/<término>` y `/recursos/<padre>/<término>`, con sus `/page/N`.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LO QUE ESTA VARIANTE TIENE Y LAS OTRAS DOS NO
 *
 * · **la jerarquía**: su ruta es `prefijo + [padre] + slug`, compuesta en la
 *   plantilla (`D2.8`), y su consulta incluye **los descendientes** — medido:
 *   el archivo de `articulos` sirve 80 tarjetas y la suma de sus 8 hijas es 80;
 * · **15 por página**, no 9;
 * · **tres filas** en la sección 1 —titular, chips, listado—, y el listado
 *   cuelga de un módulo de texto vacío en vez de la columna;
 * · **sin barra lateral**: la fila es `4_4` y la columna mide 1238.39;
 * · **los CHIPS**: un `button-group.filtros-resources` con las 8 hijas, más
 *   «Ver todos» y la marca `current` **sólo en las hijas**;
 * · su paginador es la piel **C** (`nav.kunak-pagination`);
 * · su tarjeta **no tiene extracto, ni categoría en la meta, ni `.published`**,
 *   y lleva un `<p class="resources-categories">` que las otras dos no.
 *
 * ── ⚠ LA REGLA DEL `resources-categories`, Y SU DENOMINADOR ───────────────
 * El `<p>` se pinta **sólo si el término de la entrada tiene padre**. Medido
 * sobre las **163 tarjetas** de las 18 páginas con contenido: aparece en las
 * 160 de `articulos` y sus hijas, y en **0 de las 3** de `seminarios-web`.
 *
 * Y hay que decir lo que el dato NO separa: con esta población, «tiene padre»,
 * «desciende de `articulos`» y «su URL tiene 2 segmentos» son **el mismo
 * conjunto** — **0 instancias separadoras** (§DOS MODELOS QUE PREDICEN LO
 * MISMO). Se elige «tiene padre» porque es el eje que el MODELO ya expresa
 * (`CategoriaRecurso.padre`), no porque el dato lo prefiera.
 *
 * ── Y lo que se pinta es el término de la ENTRADA, no el del archivo ──────
 * También medido, y era la pregunta obvia: el mismo post sale en el archivo del
 * padre y en el de su hija, y en los dos imprime **su propio término**
 * (`monitorizacion-aire-remediacion-suelos-contaminados` → «Contaminación en la
 * construcción» en los dos). **0 de 83 posts incoherentes entre archivos.**
 */

/** El rótulo del `<h1>` y del último eslabón de la miga: el NOMBRE del término. */
const ruta = (t: CategoriaRecurso) => (n: number) =>
  n === 1 ? rutaRecurso(t) : `${rutaRecurso(t)}/page/${n}`;

/** Los segmentos de la ruta de un término, sin el prefijo `recursos`. */
const segmentosDe = (t: CategoriaRecurso) => (t.padre ? [t.padre, t.slug] : [t.slug]);

/**
 * Parte `["articulos","page","3"]` en `{ segmentos: ["articulos"], n: 3 }`.
 *
 * ⚠ **La paginación se resuelve DENTRO del catch-all y no en una ruta hermana**,
 * y no es una preferencia: un `[...ruta]` de Next **consume todo lo que va
 * detrás**, así que `app/recursos/[...ruta]/page/[n]/` no puede existir. Es la
 * misma restricción que obliga a que este fichero sirva dos arquetipos.
 *
 * ⚠ Y `n` sale de un `Number` con guarda: `"page"` seguido de algo que no es un
 * entero **no es una ruta de paginación**, es un término que se llama así. Un
 * `Number("x") ⇒ NaN` colado aquí daría `pagina(todas, NaN)` y una página vacía
 * con 200 (§regla 6).
 */
export function parteRuta(segmentos: string[]): { segmentos: string[]; n: number } {
  const i = segmentos.length - 2;
  if (i > 0 && segmentos[i] === "page" && /^\d+$/.test(segmentos[i + 1]))
    return { segmentos: segmentos.slice(0, i), n: Number(segmentos[i + 1]) };
  return { segmentos, n: 1 };
}

/**
 * Los params de las rutas de término **con su paginación**, derivados del
 * catálogo y del recuento real de entradas.
 *
 * ⚠ **Sólo se emiten las páginas CON CONTENIDO**, que son 18 de las 37 que el
 * servidor del original sirve con 200. Las 19 vacías caen en
 * §F3-LH-VACIAS-NO-EMITIDAS por la misma razón que las 55 de `D2.5`: **su
 * frontera la decide el servidor de WordPress y no se deriva del contenido del
 * clon** (`/recursos/articulos/` acaba en la 6 por contenido y en la 16 por
 * servidor). No se inventa: se declara.
 */
export async function paramsRecursos() {
  const terminos = await categoriasRecursos();
  const fuera: { ruta: string[] }[] = [];
  for (const t of terminos) {
    const base = segmentosDe(t);
    fuera.push({ ruta: base });
    const total = Math.max(1, Math.ceil((await entradasDeRecurso(t.slug, terminos)).length / POR_PAGINA_RESOURCES));
    for (let k = 2; k <= total; k++) fuera.push({ ruta: [...base, "page", String(k)] });
  }
  return fuera;
}

/** El término cuya ruta casa con los segmentos, o `undefined`. */
export async function terminoDeRuta(segmentos: string[]): Promise<CategoriaRecurso | undefined> {
  const { segmentos: base } = parteRuta(segmentos);
  const local = `/recursos/${base.join("/")}`;
  return (await categoriasRecursos()).find((t) => rutaRecurso(t) === local);
}

/**
 * El `<title>`.
 *
 * ⚠ **«Archives» está en INGLÉS en un sitio en español, y va verbatim.** Medido:
 * `seminarios-web` da «Seminarios Web Archives - Kunak» y `contaminacion-urbana`
 * «Contaminación urbana Archives - Kunak». La excepción es `articulos`, que trae
 * un título propio de Yoast —«Artículos y Guías - Kunak», **sin** «Archives»—,
 * o sea que es un CAMPO del término y no una regla de plantilla.
 *
 * ⚠ Y por eso se guarda como excepción medida y no se inventa una regla: con
 * **1 instancia** que difiere de 9, «`articulos` tiene título propio» y
 * «los términos de primer nivel tienen título propio» son indistinguibles —
 * `seminarios-web` es de primer nivel y SÍ lleva «Archives», así que la segunda
 * queda REFUTADA con su denominador (1 de 2). La primera se replica tal cual.
 */
const TITULO_PROPIO: Record<string, string> = { articulos: "Artículos y Guías" };

export async function metadataRecurso(rutaCompleta: string[]): Promise<Metadata> {
  const { n } = parteRuta(rutaCompleta);
  const t = await terminoDeRuta(rutaCompleta);
  if (!t) return {};
  const todas = await entradasDeRecurso(t.slug, await categoriasRecursos());
  const total = Math.max(1, Math.ceil(todas.length / POR_PAGINA_RESOURCES));
  const base = TITULO_PROPIO[t.slug] ?? `${t.nombre} Archives`;
  return {
    title: n === 1 ? `${base} - Kunak` : `${base} - Página ${n} de ${total} - Kunak`,
    alternates: {
      canonical: `https://kunakair.com/es${rutaRecurso(t)}/${n === 1 ? "" : `page/${n}/`}`,
    },
  };
}

export async function PaginaRecursos({ rutaCompleta }: { rutaCompleta: string[] }) {
  const { segmentos, n } = parteRuta(rutaCompleta);
  if (!Number.isInteger(n) || n < 1) notFound();
  const terminos = await categoriasRecursos();
  const t = terminos.find((x) => rutaRecurso(x) === `/recursos/${segmentos.join("/")}`);
  if (!t) notFound();

  const todas = await entradasDeRecurso(t.slug, terminos);
  const p = pagina(todas, n, POR_PAGINA_RESOURCES);
  const href = ruta(t);

  /* Los chips: las hijas del PADRE de este archivo — o las suyas si es padre.
     Orden alfabético por NOMBRE, que es el del original en las 10 instancias. */
  const raiz = t.padre ?? t.slug;
  const hermanas = terminos
    .filter((x) => x.padre === raiz)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  const padre = terminos.find((x) => x.slug === raiz);

  /* Índice por slug, para resolver el término de cada tarjeta sin re-consultar. */
  const porSlug = new Map(terminos.map((x) => [x.slug, x]));

  const O = "https://kunakair.com/es";

  return (
    <PaginaListado
      variante="resources"
      hrefSiguiente={p.n < p.total ? href(p.n + 1) : undefined}
      hrefAnterior={p.n > 1 ? href(p.n - 1) : undefined}
      miga={[
        { label: "Inicio", href: "/" },
        /* `/recursos/` es `L4-listado-embebido` y **no está clonada** (va en la
           cola de F3-2), así que el eslabón se queda apuntando al original —
           §Regla de rutas locales.
           href original: `https://kunakair.com/es/recursos/` */
        { label: "Recursos", href: `${O}/recursos/` },
        /* El eslabón del padre sólo existe en las hijas: `class="taxonomia
           padre"` en 8 de 10 archivos, ausente en los 2 de primer nivel. */
        ...(t.padre && padre
          ? [{ label: padre.nombre, href: rutaRecurso(padre), clase: "taxonomia padre" }]
          : []),
        { label: t.nombre, clase: "categoria" },
      ]}
      titular={
        <ModuloTexto n={1}>
          {/* Los rótulos por idioma. ⚠ **`resources` sirve DOS y `/etiqueta`
              TRES**: aquí no hay `ocultar-fr`. Medido en los 10 archivos. */}
          <span className="tax-tap tax-tap-category ocultar-en">Resources</span>{" "}
          <span className="tax-tap tax-tap-category ocultar-es">Recursos</span>{" "}
          <h1>{t.nombre}</h1>
        </ModuloTexto>
      }
      chips={
        /* ⚠ **En `seminarios-web` el módulo va VACÍO — sin `et_pb_text_inner`
           siquiera**, porque ese término no tiene hermanas. Emitir el envoltorio
           con una lista vacía sería un nivel de más en el árbol que el barrido
           lee. Medido: 0 chips en 1 de 10. */
        hermanas.length ? (
          <ModuloTexto n={2}>
            <div className="button-group filtros-resources">
              {/* «Ver todos» sólo en las HIJAS: el archivo del padre YA es
                  «todos», y su chip-grupo empieza directamente por la primera
                  hija. Medido: 8 chips en `articulos`, 9 en las 8 hijas. */}
              {t.padre && padre ? (
                <a href={rutaRecurso(padre)} className="button show-all">
                  Ver todos
                </a>
              ) : null}
              {hermanas.map((x) => (
                <a
                  key={x.slug}
                  href={rutaRecurso(x)}
                  className={x.slug === t.slug ? "button current" : "button"}
                >
                  {x.nombre}
                </a>
              ))}
            </div>
          </ModuloTexto>
        ) : (
          <ModuloTexto n={2} vacio />
        )
      }
      listado={
        <div className="et_pb_module et_pb_blog_0_tb_body bucle-entradas et_pb_posts et_pb_bg_layout_light">
          <div className="et_pb_ajax_pagination_container">
            {p.items.map((e, i) => {
              const term = e.recurso ? porSlug.get(e.recurso.slug) : undefined;
              return (
                <TarjetaListado
                  key={e.slug}
                  entrada={e}
                  variante="resources"
                  indice={i}
                  fecha={fechaCorta(e.fechaPublicacion)}
                  /* ruta local: las 149 entradas ya están clonadas en `/[slug]`.
                     href original: `https://kunakair.com/es/<slug>/` */
                  hrefEntrada={`/${e.slug}`}
                  hrefCategoria=""
                  /* La regla del §resources-categories: sólo si tiene padre. */
                  {...(term?.padre
                    ? { hrefTermino: rutaRecurso(term), nombreTermino: term.nombre }
                    : {})}
                />
              );
            })}
          </div>
        </div>
      }
      paginador={<Paginador piel="C" n={p.n} total={p.total} href={href} />}
    />
  );
}
