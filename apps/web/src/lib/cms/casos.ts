/**
 * LOS CASOS DE ÉXITO, LEÍDOS DEL CMS — F2-3, con el proyector genérico.
 *
 * `src/lib/casos.ts` **no se borra**: pasa a seed histórico —es lo que
 * `catalogos.mjs` inserta y la referencia del round-trip 63/63— y sigue
 * aportando lo que es PLANTILLA y no dato: `prefijoDe`, `rutaDe` y
 * `metadataDeCaso`, que **derivan** de los campos en vez de guardarse.
 *
 * ── Una colección, DOS rutas, y por eso el helper va aquí ─────────────────
 * `/casos-de-exito/[slug]` y `/case-studies/[slug]` sirven el mismo componente
 * sobre la misma colección filtrando por `prefijo` (D2 · CMS-1). `getCaso`
 * necesita el catálogo, así que su versión asíncrona vive aquí; el resto de
 * helpers son puros sobre un caso y se quedan donde estaban.
 *
 * ── Lo que garantiza que esta proyección es fiel ──────────────────────────
 * `qa:cms-roundtrip` (63/63) + `qa:cms-lectura` (63/63, negativo 4/4) + el Δ0
 * de esta familia: `qa:clon-base` a dos anchos y `qa:html-cmp` byte a byte
 * contra el HTML anterior a la migración.
 */
import { prefijoDe } from "@/lib/casos";
import type { CasoDeExito } from "@/types/kunak";
import { leeColeccion } from "./proyector";

export async function casosPublicados(): Promise<CasoDeExito[]> {
  return leeColeccion<CasoDeExito>("casos");
}

/**
 * Busca por prefijo + slug: **las dos partes**, no solo el slug — la misma
 * regla que documentaba `getCaso` en `src/lib/casos.ts`, y por eso vive en UN
 * sitio y no repetida en las dos páginas.
 *
 * El original responde a las rutas cruzadas con 301 (7 de 9) o 404 (2 de 9),
 * pero eso es comportamiento de servicio y no dato del contenido (C-SP2,
 * cerrada como no-bloqueante en D2). Servir el mismo caso bajo los dos
 * prefijos sería inventar enrutado, no clonarlo.
 */
export async function getCasoCms(prefijo: string, slug: string): Promise<CasoDeExito | undefined> {
  return (await casosPublicados()).find((c) => prefijoDe(c) === prefijo && c.slug === slug);
}
