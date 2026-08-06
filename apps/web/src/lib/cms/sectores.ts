/**
 * SECTOR y MONOGRÁFICO TÉCNICO, LEÍDOS DEL CMS — F2-3, con el proyector
 * genérico. **Son las dos colecciones de más forma del modelo.**
 *
 * `qa:lectura-forma` las midió: `sectores` trae 8 `upload`, 1 relación, 1 unión
 * de bloques, 12 arrays y **108 hojas**; `monograficos`, 8 · 1 · 2 · 2
 * `richText` · 17 arrays y **199 hojas**. Escribir su proyector a mano sería
 * re-implementar el walker en TypeScript —la «segunda lista escrita a mano»
 * contra la que avisa la cabecera de `mapeo.mjs`—, y aquí peor que en el seed:
 * allí las dos listas se comparan entre sí (el round-trip) y en el render **no
 * hay pareja**, así que un olvido sólo se vería si mueve píxeles.
 *
 * Por eso aquí tampoco hay lista: hay una llamada a `leeColeccion`. Lo único
 * que se declara es **el tipo medido que se espera de vuelta**, que sí es útil:
 * si el esquema dejara de expresar un campo de `SectorPage`, el error es de
 * compilación y no un hueco en la página.
 *
 * `src/lib/sectores.ts` y `src/lib/monografico.ts` **no se borran**: pasan a
 * seed histórico y siguen aportando lo que es PLANTILLA —`SECTORES_INDICE`, que
 * es un índice de URLs para el menú y el pie, y los tipos.
 *
 * ── Lo que garantiza que esta proyección es fiel ──────────────────────────
 * `qa:cms-roundtrip` (63/63) + `qa:cms-lectura` (63/63, negativo 4/4 — y midió
 * estas dos con sus 108 y 199 hojas) + el Δ0 de esta familia: `qa:clon-base` a
 * dos anchos y `qa:html-cmp` byte a byte contra el HTML anterior.
 */
import type { MonograficoPage } from "@/lib/monografico";
import type { SectorPage } from "@/lib/sectores";
import { leeColeccion } from "./proyector";

export async function sectoresPublicados(): Promise<SectorPage[]> {
  return leeColeccion<SectorPage>("sectores");
}

export async function monograficosPublicados(): Promise<MonograficoPage[]> {
  return leeColeccion<MonograficoPage>("monograficos");
}
