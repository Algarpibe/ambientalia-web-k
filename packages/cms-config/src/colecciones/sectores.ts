/**
 * SECTOR y MONOGRÁFICO — §1.4, §1.5 y §1.5b.
 *
 * **DOS colecciones, no una con discriminante** (§1.5b, cerrada 2026-07-30). Y
 * no se re-investiga: la fricción está medida —`EXPERIMENTO-URBANO.md` §8
 * transcribió el cuerpo de Urbano al modelo del monográfico con umbral cero y
 * **H1 quedó rechazada por C1**, con los tres campos de la frontera costados
 * (+12.39/−90.58 · +10 · offset 121.03)—. Unirlas hoy obliga a añadir esos tres
 * campos al monográfico *para nada más que la unión*, que es el arreglo falso
 * que este proyecto ya sabe reconocer.
 *
 * **Lo común se declara UNA vez** (`campos/comunes.ts`) y se esparce en las dos:
 * *lo que se duplica es el documento, no la definición*. Cambiar un campo común
 * sigue siendo un cambio en un solo sitio, igual que con una colección única.
 */
import type { CollectionConfig } from "payload";
import { breadcrumb, colaComercial, header, seo } from "../campos/comunes.ts";
import { BLOQUES_SECTOR, heroSector } from "../bloques/sector.ts";
import { cuerpoMonografico, heroMonografico } from "../bloques/monografico.ts";

export const sectores: CollectionConfig = {
  slug: "sectores",
  admin: { useAsTitle: "slug", group: "Páginas" },
  fields: [
    // Único en la colección. La unicidad que hace falta imponer es **ENTRE
    // familias** (§4) y es del bloque 3: aquí solo está la nativa por colección.
    { name: "slug", type: "text", required: true, unique: true, index: true },
    seo({ canonical: true }),
    breadcrumb,
    header,
    heroSector,
    // Cuerpo libre: los bloques que monte cada sector, en su orden.
    { name: "body", type: "blocks", blocks: BLOQUES_SECTOR },
    ...colaComercial,
  ],
};

export const monograficos: CollectionConfig = {
  slug: "monograficos",
  admin: { useAsTitle: "slug", group: "Páginas" },
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    seo({ canonical: true }),
    breadcrumb,
    // Reutiliza la cabecera de SECTOR **tal cual**: idéntica al céntimo en las 4.
    header,
    heroMonografico,
    cuerpoMonografico,
    ...colaComercial,
  ],
};
