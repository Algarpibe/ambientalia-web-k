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

/* ══════════════════════════════════════════════════════════════════════════
 * EL ORDEN DE `/casos-de-exito/` (`L5`) — `fechaPublicacion` DESC
 *
 * ⚠⚠ **EL FORMATO DE ESTE CAMPO NO ES EL DE `entradas-blog`, y confundirlos es
 * el fallo que la ficha ya nombra** (§F3-LH-FECHA-DOS-FORMATOS, *1 concepto ·
 * 2 formatos · 3 colecciones*):
 *
 * | colección | verbatim de | ejemplo | parser |
 * |---|---|---|---|
 * | `entradas-blog` | la fecha **RENDERIZADA** (el original la pinta) | `7 enero 2025` | `aEpoch` de `cms/listados.ts` |
 * | **`casos`** | el **JSON-LD**, que es donde único existe | `2021-04-20T10:35:17+02:00` | **`aEpochIso`, aquí** |
 *
 * Reutilizar `aEpoch` aquí **tira en las 57** —no casa el ISO—, que es la
 * dirección buena del fallo. Lo que no puede pasar es lo contrario: un
 * `?? 0` mandaría el caso al final del listado **en silencio** y el índice
 * saldría plausible con una tarjeta fuera de sitio (§sondas 6).
 *
 * ── LO QUE RESPALDA QUE ÉSTA ES LA CLAVE, y no un acierto ─────────────────
 * `qa:lh-fecha-orden`: **57/57** contra el orden SERVIDO, elegido con **56
 * posiciones separadoras** frente a tres rivales (`fecha-asc` · `alfabetico` ·
 * `orden-corpus`), **0 empates** y **0 sin fecha**. Cruzado además contra la DB
 * en la 82.ª tanda: los 57 slugs en el mismo orden que el canal SIN RECORTAR
 * (`corpus/fase-3/listados/casos-de-exito/index.html`), no contra el espejo,
 * que congela `slice(0, 3)`.
 *
 * ⚠ **El desempate por slug NO está ejercitado**: hay 0 empates en las 57. Está
 * puesto para que el orden sea estable si algún día los hay, y eso es un camino
 * SIN ESTRENAR — se declara, no se da por soportado.
 * ═════════════════════════════════════════════════════════════════════════ */

/** ISO 8601 → epoch. **Tira** si no casa: ver el bloque de arriba. */
export function aEpochIso(fecha: string): number {
  const t = Date.parse(fecha);
  if (!Number.isFinite(t))
    throw new Error(
      `fechaPublicacion (casos) no parseable como ISO 8601: '${fecha}'.\n` +
        `  Devolver 0 aquí mandaría el caso al final del índice sin decirlo, que es\n` +
        `  exactamente cómo un valor por defecto convierte «no lo sé» en «está bien».`,
    );
  return t;
}

/**
 * Los 57 casos en el orden en que `/es/casos-de-exito/` los sirve.
 *
 * **Los 57, sin paginar** (`D5.5`): el original sirve la colección entera en una
 * página y **no pinta paginador**. Rebanar aquí sería inventar un
 * comportamiento que el original no tiene, y se vería en `nTarjetas` y en `docH`
 * a la vez.
 */
export async function casosDelIndice(): Promise<CasoDeExito[]> {
  return [...(await casosPublicados())].sort(
    (a, b) => aEpochIso(b.fechaPublicacion) - aEpochIso(a.fechaPublicacion) || a.slug.localeCompare(b.slug),
  );
}
