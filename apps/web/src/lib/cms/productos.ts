/**
 * LOS PRODUCTOS (CPT `solutions`), LEÍDOS DEL CMS — F2-3, con el proyector
 * genérico.
 *
 * `ESQUEMA-CMS.md` §2e (una colección con discriminante) · §4 (el plano de
 * `/es/`) · `PLAN-FASE-2.md` §F2-3.
 *
 * ── Es la única colección con lado medido que NO es familia de ruta ────────
 * Las otras siete migradas tienen su `page.tsx`. `productos` no: hoy el clon
 * **construye 3** de los 9 (`monitor-calidad-aire`, `software-…`, `kunak-api`)
 * y esos tres son páginas propias, no instancias de un arquetipo `productos`.
 * Lo que se migra aquí es **el uso del producto como DATO** en los tres sitios
 * que lo pintan: la home, las páginas de sector y la ficha de caso.
 *
 * `src/lib/products.ts` **no se borra**: pasa a seed histórico —es lo que
 * `catalogos.mjs` inserta— y sigue aportando `PRODUCTOS_HOME_IDS`, que es
 * ESTRUCTURA (qué productos lista la home y en qué orden), no dato del
 * producto.
 *
 * ── ⚠ `href` NO viene de la DB: lo COMPONE la vuelta, y eso tiene número ───
 * §4 decidió no guardar `href`: la ruta es `padre` + `slug`, y `devuelveProducto`
 * la recompone **local para los 9**. El dato medido trae **3 locales y 6
 * absolutas al original** (los 6 que el clon sólo referencia), así que al leer
 * del CMS esos 6 pasan a apuntar a una ruta que **el build no emite**.
 *
 * Eso está **declarado** en §4 —dentro del CMS los 24 son documentos, así que su
 * ruta es local por definición— y **no lo caza ninguna sonda de las que hay**,
 * porque no llega al marcado visible: el panel de un producto sólo se sirve
 * cuando es el ACTIVO, y el activo es `monitor-calidad-aire` en las 10
 * instancias. Los otros ocho viajan en la **carga RSC** como props del
 * componente cliente. Medido y fichado en `PENDIENTES-QA.md` §F2-3-HREF-DERIVADO
 * con su instrumento (`npm run qa:tipo-hoja`, eje `href`).
 */
import type { Product } from "@/types/kunak";
import { leeColeccion } from "./proyector";

export async function productosPublicados(): Promise<Product[]> {
  return leeColeccion<Product>("productos");
}

/**
 * Proyecta los `id` que guarda un caso (§2b, relación por `data-id`) a sus
 * productos, **en el orden en que el caso los guarda**.
 *
 * Conserva la semántica de `getProductos` de `src/lib/products.ts`: un `id` sin
 * producto **tira**. Es la regla 6 (*una ausencia se rechaza, no se sustituye*)
 * y aquí muerde más que antes — con la fuente en la DB, un slug editado desde el
 * admin tiene que romper el build, no pintar el bloque con una ficha menos.
 */
export async function getProductosCms(ids: string[]): Promise<Product[]> {
  const porId = new Map((await productosPublicados()).map((p) => [p.id, p]));
  return ids.map((id) => {
    const p = porId.get(id);
    if (!p) throw new Error(`Producto desconocido en \`soluciones\`: "${id}"`);
    return p;
  });
}
