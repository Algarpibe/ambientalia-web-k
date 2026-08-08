/**
 * LA MITAD DE VUELTA DE `PREPARA` — extraída de `scripts/seed/seed.mjs` el
 * 2026-08-06 (CMS-0g), **sin cambiar una línea de lógica**.
 *
 * ── Por qué se mueve, y por qué sólo la vuelta ────────────────────────────
 * `PREPARA` (la ida) sólo la usa el seed, que corre en Node con acceso al disco.
 * `DEVUELVE` (la vuelta) la necesitaba **el round-trip** y desde F2-3 la
 * necesita también **el RENDER**, que no puede importar `seed.mjs`: ese fichero
 * abre ficheros, resuelve rutas de `apps/web/public` y habla con Payload.
 *
 * Son funciones **puras sobre el dato**, así que su sitio es el paquete
 * compartido. `seed.mjs` las re-exporta para que nada de lo que ya las
 * importaba cambie de sitio — y para que siga habiendo **una sola definición**:
 * copiarlas habría sido la clase C7, dos definiciones de «lo mismo».
 *
 * ⚠ **Su coherencia con `PREPARA` se sigue EJECUTANDO donde estaba**
 * (`sonInversas()` en `seed.mjs`, `DEVUELVE(PREPARA(fila))` sobre las 46 filas).
 * Mover la vuelta no afloja esa comprobación: la sigue haciendo quien tiene los
 * dos lados delante.
 */

/**
 * La ruta local de un `href` medido: sin origen, sin el `/es` del original y
 * sin barra final (`trailingSlash` no está activado — `CLAUDE.md` §Regla de
 * rutas locales).
 */
export function rutaLocal(href) {
  if (typeof href !== "string") return href;
  const segs = href
    .replace(/^https?:\/\/[^/]+/, "")
    .replace(/^\/es(?=\/|$)/, "")
    .split("/")
    .filter(Boolean);
  return `/${segs.join("/")}`;
}

/**
 * `productos`: deshace los alias de §2e y compone el CANDIDATO local del §4.
 * ⚠ Es el candidato, no el `href` final: la regla de rutas locales (construido
 * → local, no construido → original) la aplica el RENDER con `entorno.mjs` —
 * aquí no hay entorno que consultar y meterlo rompería la pureza y el
 * round-trip (§F2-3-HREF-DERIVADO, salida b).
 */
export function devuelveProducto(d) {
  const { slug, titulo, padre, ...resto } = d;
  return {
    id: slug,
    name: titulo,
    ...resto,
    href: `/${[padre, slug].filter(Boolean).join("/")}`,
  };
}

/** `taxonomia-sectores`: la relación polimórfica vuelve a ser un slug. */
export function devuelveTermino(d) {
  const { pagina, ...resto } = d;
  return { ...resto, ...(pagina !== undefined ? { paginaSlug: pagina } : {}) };
}

export const DEVUELVE = {
  productos: devuelveProducto,
  "taxonomia-sectores": devuelveTermino,
};

/**
 * La forma medida de un documento, tal y como la escribe quien lo EMBEBE.
 * `rutaLocal` se aplica al `href` medido porque el CMS no puede representar «este
 * destino todavía no está clonado».
 */
export function comoEmbebido(coleccion, fila) {
  if (coleccion !== "productos") return fila;
  return { ...fila, href: rutaLocal(fila.href) };
}
