/**
 * LOS CATÁLOGOS DEL GRUPO A, LEÍDOS DEL CMS — F2-3, con el proyector genérico.
 *
 * ── Por qué esto no se parece a `cms/faqs.ts` ─────────────────────────────
 * El canario listaba sus cuatro campos a mano. Aquí **no hay lista**: una
 * llamada a `leeColeccion`, que pasa el walker de `mapeo.mjs` —el mismo que
 * escribió el seed— sobre la config. `qa:lectura-forma` midió por qué: estas
 * colecciones traen `upload` y `relationship`, y `documentos-cientificos` son 21
 * hojas. Copiar la forma del canario habría sido re-implementar el walker.
 *
 * Lo único que se declara aquí es **el TIPO medido que se espera de vuelta**, y
 * eso sí es útil: si el esquema dejara de expresar un campo de
 * `DocumentoCientifico`, el error es de compilación y no un hueco en la página.
 *
 * ── Lo que garantiza que estos datos son los de `src/lib` ─────────────────
 * `qa:cms-roundtrip` (63/63) + `qa:cms-lectura` (63/63, negativo 4/4) +
 * el Δ0 de esta familia: `qa:clon-base` a dos anchos y `qa:html-cmp` byte a byte
 * contra el HTML anterior a la migración.
 */
import type { DocumentoCientifico, EntradaBlog, TerminoKunakpedia } from "@/types/kunak";
import { leeColeccion } from "./proyector";

export async function documentosCientificos(): Promise<DocumentoCientifico[]> {
  return leeColeccion<DocumentoCientifico>("documentos-cientificos");
}

/* ══════════════════════════════════════════════════════════════════════════
 * EL PLANO DE RAÍZ — `/[slug]`, las DOS formas
 *
 * Mismo patrón que arriba y que `cms/casos.ts`: una llamada al proyector
 * genérico por colección, y los helpers de despacho al lado porque necesitan el
 * catálogo. `src/lib/arquetipo-a.ts` **no se borra**: es lo que `catalogos.mjs`
 * siembra y la referencia del round-trip, y sigue aportando lo que es PLANTILLA
 * —`BLOQUE_RELACIONADOS`, que no es dato de ninguna entrada—.
 *
 * ⚠ **Y lo que esta familia NO puede prometer, dicho aquí y no en el acta:**
 * `entradas-blog` es la única colección con `<script>` en el dato medido, y el
 * seed les aplica T4a **y T4b**. T4b **sustituye, no restaura**: el visor de PDF
 * de FB3D llega como un enlace al PDF con `data-media`. O sea que **4 de estas
 * rutas NO están a Δ0 contra el clon de `src/lib`, y no pueden estarlo.**
 *
 * Lo que sí está a Δ0 es todo lo demás de esas páginas, y eso se mide APARTE —
 * si se midiera la ruta entera, la sustitución taparía cualquier regresión que
 * entrara con ella. Criterio por clase y su instrumento:
 * `PENDIENTES-QA.md` §F2-3-T4B-CRITERIO · `npm run qa:t4b-bloque`.
 * ═════════════════════════════════════════════════════════════════════════ */

export async function entradasBlog(o?: { conBorradores?: boolean }): Promise<EntradaBlog[]> {
  return leeColeccion<EntradaBlog>("entradas-blog", o);
}

export async function terminosKunakpedia(o?: {
  conBorradores?: boolean;
}): Promise<TerminoKunakpedia[]> {
  return leeColeccion<TerminoKunakpedia>("terminos-kunakpedia", o);
}

export type PaginaPlana =
  | { forma: "blog"; datos: EntradaBlog }
  | { forma: "termino"; datos: TerminoKunakpedia };

/**
 * Despacho por slug contra los dos catálogos planos, como `/sectores/[slug]`.
 *
 * Vive aquí y no en la página por la misma razón que `getCasoCms`: necesita los
 * catálogos, y tenerlo en un sitio evita que `generateStaticParams`,
 * `generateMetadata` y el componente lean el CMS por tres caminos distintos.
 */
export async function getPaginaPlanaCms(
  slug: string,
  o?: { conBorradores?: boolean },
): Promise<PaginaPlana | null> {
  const b = (await entradasBlog(o)).find((e) => e.slug === slug);
  if (b) return { forma: "blog", datos: b };
  const t = (await terminosKunakpedia(o)).find((e) => e.slug === slug);
  if (t) return { forma: "termino", datos: t };
  return null;
}
