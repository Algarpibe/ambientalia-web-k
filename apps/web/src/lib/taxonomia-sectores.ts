import type { TerminoSector } from "@/types/kunak";

/**
 * `taxonomia-sectores` — los **11 términos** de sector, colección propia.
 *
 * Recon: `docs/research/grupo-C/` (C-1, censo 76/76) · decisión D3 en su
 * `DECISIONES.md` · modelo en `MODELO.md` §3 · Payload en
 * `docs/ESQUEMA-CMS.md` §2b.
 *
 * ── Por qué taxonomía y no una cadena en el caso ───────────────────────────
 * El censo de los 57 casos dio **11 valores normalizados en 57 asignaciones**,
 * con **4 casos de dos términos**: eso es un vocabulario, no prosa. (Las «15
 * cadenas» del recon eran estas 11 contando los 4 chips plurales como cadenas
 * propias.) Y el original ya las trata así: cada término enlaza a su archivo
 * `/es/sector/<slug>/`, que es territorio del grupo B.
 *
 * ── Los slugs se MIDIERON, no se derivaron del nombre ──────────────────────
 * Salen de los `href` del índice `/es/casos-de-exito/` (2026-07-30), que los
 * lista los 11 de una vez. Derivarlos del nombre habría dado `oil-gas` y
 * `edar-ptar`; el original sirve **`oil-gas-es`** y **`edar`**. Es la regla de
 * la casa: contra la salida servida, nunca contra lo que uno supone.
 *
 * ── `paginaSlug` es OPCIONAL, y esa es la mitad del hallazgo ───────────────
 * Hay **11 términos y 8 páginas**: Olores, Metalurgia, Sports y Obras no
 * tienen página de sector. Por eso `sectores` del caso **no** es una relación
 * a la página: es una relación al término, y el término lleva la página cuando
 * existe. De las 8, el clon ha construido 6 (Puertos y Minería se dejaron
 * fuera a propósito — razón en `docs/PENDIENTES-QA.md`), así que las otras dos
 * apuntan al original hasta que se claven.
 */
export const TERMINOS_SECTOR: TerminoSector[] = [
  // Frecuencia en los 57 casos censados, al lado de cada uno.
  { slug: "urbano", nombre: "Urbano", paginaSlug: "calidad-del-aire-en-las-ciudades" },      // 17
  { slug: "industria", nombre: "Industria", paginaSlug: "control-de-emisiones-industriales" }, // 8
  { slug: "investigacion-consultoria", nombre: "Investigación y consultoría", paginaSlug: "estudio-de-la-contaminacion-atmosferica" }, // 7
  // Puertos y Minería tienen página en el original pero NO están clonadas
  // (permutaciones de una topología ya validada): sin `paginaSlug`, el chip
  // sigue apuntando al archivo de taxonomía, que tampoco está clonado.
  { slug: "puertos", nombre: "Puertos y aeropuertos" },                                       // 7
  { slug: "mineria", nombre: "Minería" },                                                     // 5
  { slug: "olores", nombre: "Olores" },                                                       // 5 — sin página
  { slug: "edar", nombre: "EDAR / PTAR", paginaSlug: "monitorizacion-ambiental-y-control-de-olores-en-edar" }, // 3
  { slug: "metalurgia", nombre: "Metalurgia" },                                               // 2 — sin página
  { slug: "obras", nombre: "Obras" },                                                         // 1 — sin página
  { slug: "oil-gas-es", nombre: "Oil & Gas", paginaSlug: "monitorizacion-de-emisiones-en-petroleo-y-gas" }, // 1
  { slug: "sports", nombre: "Sports" },                                                       // 1 — sin página
];

const POR_SLUG = new Map(TERMINOS_SECTOR.map((t) => [t.slug, t]));

/** Un término por slug. Lanza si no existe: un slug inventado es un dato malo. */
export function getTermino(slug: string): TerminoSector {
  const t = POR_SLUG.get(slug);
  if (!t) throw new Error(`Término de sector desconocido: "${slug}"`);
  return t;
}

/**
 * El destino del chip y de la fila «Sector(es)».
 *
 * **Regla de rutas locales**: el destino real del original es el archivo de
 * taxonomía `/es/sector/<slug>/`, que es del **grupo B y no está clonado**, así
 * que el enlace se queda apuntando fuera. No se sustituye por la página de
 * sector aunque exista: son dos páginas distintas —un archivo de 23 entradas no
 * es una solución vertical— y cambiarlo sería inventar enrutado, no clonarlo.
 * `paginaSlug` está en el término para cuando el grupo B se construya.
 */
export function hrefTermino(t: TerminoSector): string {
  return `https://kunakair.com/es/sector/${t.slug}/`;
}
