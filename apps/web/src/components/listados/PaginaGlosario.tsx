import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PaginaArchivoCpt } from "@/components/listados/PaginaArchivoCpt";
import { Paginador } from "@/components/listados/Paginador";
import { terminosKunakpedia } from "@/lib/cms/arquetipo-a";
import { extractoDerivado, pagina } from "@/lib/cms/listados";
import type { TerminoKunakpedia } from "@/types/kunak";

/**
 * `L2-glosario` — `/glosario` y `/glosario/page/N`.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * EL ORDEN, Y POR QUÉ NO REUSA `porFechaDesc`
 *
 * `CMS-ORDEN-L2` (§7g): el archivo va por `datePublished` **DESC**, **37/37**
 * contra el orden servido y con **36 posiciones separadoras** frente a tres
 * rivales (`qa:lh-fecha-orden`, negativo 4/4).
 *
 * ⚠ **El comparador de `entradas-blog` NO vale aquí, y no por gusto**:
 * `aEpoch()` parsea el literal español («7 de enero de 2025») y **tira** si no
 * casa — que es lo correcto allí—, mientras que `TerminoKunakpedia
 * .fechaPublicacion` guarda el **ISO del JSON-LD**, porque el término no pinta
 * su fecha en ninguna parte y ése es el único canal que la sirve. Dos medios
 * distintos para la misma magnitud, fichado en §F3-LH-FECHA-DOS-FORMATOS.
 * Pasarle un ISO a `aEpoch` no daría un orden malo: **daría un `throw`**.
 *
 * El desempate va por `slug` para que el orden sea **estable**: sin él, dos
 * fechas iguales dejarían el reparto en páginas a merced del orden de la DB, y
 * eso es una diferencia que aparecería y desaparecería entre builds sin que
 * nada cambiara (§regla 16 — la hipótesis del no-determinismo, fabricada).
 *
 * ── El cardinal de la serie sale del CANAL SIN RECORTAR ──────────────────
 * `span.pages` dice **«Page 1 of 8»** en `corpus/fase-3/listados/glosario/`, y
 * `entradasPorPagina = 5` es parámetro de plantilla de la variante (`D2.2`,
 * varianza 0 dentro de cada CPT). `⌈37/5⌉ = 8` ✓ — o sea que el cardinal
 * medido y el derivado **coinciden**, que es la comprobación que hace que
 * ninguno de los dos sea un número suelto.
 *
 * ⚠ **`POR_PAGINA` de `listados.ts` es 9 y NO se reutiliza.** Coincidir no
 * acopla: son dos plantillas distintas y el día que una cambie la otra no debe
 * seguirla. Aquí ni siquiera coinciden.
 *
 * ── Lo que esta forma NO sirve, y hace falta decirlo ─────────────────────
 * · **`h1`** — 12 documentos sin `<h1>` (`D4b`), 0 con `<h1>` vacío en 149;
 * · **miga** — el corpus no la trae: entre `#et-main-area` y el primer
 *   `<article>` no hay nada;
 * · **imagen** — `media: null` en las tarjetas medidas, aunque el `<article>`
 *   lleve `has-post-thumbnail`. Se replica la clase porque está servida y no
 *   se emite la imagen porque no lo está;
 * · **fecha ni categoría en la tarjeta** — `fecha: null`, `categoria: null`,
 *   `meta: null`. Las etiquetas servidas dentro del `<article>` son
 *   exactamente `["h2", "a"]`.
 */

/** El literal `<title>` de Yoast, medido en la captura de la página 1. */
const TITULO = "Kunakpedia Archive - Kunak";

const ruta = (n: number) => (n === 1 ? "/glosario" : `/glosario/page/${n}`);

/** 5 por página — `D2.2`, y `⌈37/5⌉ = 8` reproduce el «Page 1 of 8» servido. */
const POR_PAGINA_L2 = 5;

/** DESC por el ISO del JSON-LD, y por `slug` a igualdad — orden ESTABLE. */
const porFechaIsoDesc = (a: TerminoKunakpedia, b: TerminoKunakpedia) =>
  b.fechaPublicacion.localeCompare(a.fechaPublicacion) || a.slug.localeCompare(b.slug);

async function terminosOrdenados(): Promise<TerminoKunakpedia[]> {
  return (await terminosKunakpedia()).slice().sort(porFechaIsoDesc);
}

export async function paginasDeGlosario() {
  const todos = await terminosOrdenados();
  return Math.max(1, Math.ceil(todos.length / POR_PAGINA_L2));
}

export async function metadataGlosario(n: number): Promise<Metadata> {
  const total = await paginasDeGlosario();
  return {
    /* El patrón de las páginas 2..N no está capturado para esta serie: sólo se
       midió la 1. Se sirve el mismo que `L1` —«… - Página N de M - Kunak»—,
       que es la única forma de `<title>` paginado que este sitio ha servido en
       lo medido, y queda **SIN VERIFICAR** para `L2` con su cardinal: 1 de 8
       páginas capturadas. */
    title: n === 1 ? TITULO : `Kunakpedia Archive - Página ${n} de ${total} - Kunak`,
    alternates: { canonical: `https://kunakair.com/es${n === 1 ? "/glosario/" : `/glosario/page/${n}/`}` },
  };
}

export async function PaginaGlosario({ n }: { n: number }) {
  if (!Number.isInteger(n) || n < 1) notFound();
  const todos = await terminosOrdenados();
  const p = pagina(todos, n, POR_PAGINA_L2);

  return (
    <PaginaArchivoCpt
      hrefSiguiente={p.n < p.total ? ruta(p.n + 1) : undefined}
      hrefAnterior={p.n > 1 ? ruta(p.n - 1) : undefined}
      /* ⚠⚠ **EL RÓTULO DE LA TARJETA ES `tituloMiga`, Y ESO ESTÁ DERIVADO CON
         SU DENOMINADOR ENTERO: 37/37 contra la miga y 0/37 contra el `h1`.**

         No es una elección entre dos campos plausibles. Barridas las 8 páginas
         del corpus contra las 37 capturas de término, el texto del
         `h2.entry-title` coincide con el **último eslabón de la miga** en las
         37 y con el `<h1>` en **ninguna** — el `h1` es el titular largo
         («Óxidos de nitrógeno (NOx) y óxido nitroso (N2O): impacto y…») y la
         tarjeta el nombre corto («Óxidos de nitrógeno (NOx)»).

         ⚠ **Y ese campo está MAL EN EL DATO, con su cardinal — pero no es un
         defecto que `L2` introduzca** (§F3-LH-ROTULO-SIN-MARCADO). El original
         sirve `<sub>` en el rótulo y el extractor lo tiró al transcribir:

         | campo | el clon sirve | cardinal |
         |---|---|---|
         | `tituloMiga` | `Oxígeno (O 2 )` — etiquetas fuera **y un espacio dentro** | **9 de 37** términos · 1 de 152 blog · 0 de 23 doc |
         | `titulo` (el `h1`) | `Oxígeno (O2)` — etiquetas fuera, **sin** espacio | **6 de 37** términos |

         Lleva servido en la miga de `/[slug]` desde que se transcribieron los
         términos; `L2` lo hace visible en un **segundo sitio**, que es
         §*a veces el detector de un defecto no es otro ANCHO, es otro
         CONTENIDO*. Arreglarlo es esquema + re-extracción + re-siembra, o sea
         una tanda; aquí se declara y **no se parchea con una tabla de
         sustituciones**, que sería inventar. */
      listado={p.items.map((t) => (
        /* Las clases del `<article>` son las del MÓDULO de Divi, aunque el
           cascarón sea la plantilla PHP: `et_pb_post` + el `post-<id>` y el
           `type-<cpt>`. El clon no tiene los ids de WordPress, así que emite
           lo que sí puede sostener —`et_pb_post`, `glossary`, `type-glossary`,
           `status-publish`, `hentry`— y **no inventa** un `post-N`. Queda
           declarado: es una clase servida que el clon no reproduce. */
        <article key={t.slug} className="et_pb_post glossary type-glossary status-publish hentry">
          <h2 className="entry-title">
            {/* ruta local: los 37 términos ya están clonados en `/[slug]`.
                href original: `https://kunakair.com/es/<slug>/` */}
            <a href={`/${t.slug}`}>{t.tituloMiga ?? t.titulo}</a>
          </h2>
          {/* Texto SUELTO, sin envoltorio — como el original. Meterlo en un
              `<p>` cambiaría el nº de hijos del `<article>` y su ritmo. */}
          {extractoDerivado(t.cuerpo)}
        </article>
      ))}
      paginador={<Paginador piel="B" n={p.n} total={p.total} href={ruta} />}
    />
  );
}
