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
 * ── `href` NO viene de la DB: candidato en la vuelta + regla en el render ──
 * §4 no guarda `href`: `devuelveProducto` compone el CANDIDATO local
 * (`padre` + `slug`) y el proyector le aplica después la regla de rutas
 * locales (`segunEntorno`): construido → local; no construido → el original.
 * Cerró §F2-3-HREF-DERIVADO (F2-5, salida b) — antes la vuelta componía local
 * para los 9 y 6 apuntaban a rutas que el build no emite. La guarda es
 * `npm run qa:tipo-hoja` (eje `href`, veredicto contra el manifiesto real):
 * sigue sin verlo ninguna otra sonda, porque estos `href` viajan en la carga
 * RSC — el panel de un producto sólo se sirve cuando es el ACTIVO.
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
