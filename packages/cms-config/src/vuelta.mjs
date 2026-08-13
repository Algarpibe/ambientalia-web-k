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
  const { slug, titulo, padre, pagina, hrefServido, ...resto } = d;
  return {
    id: slug,
    name: titulo,
    ...resto,
    /**
     * CMS-PR3 · dos orígenes, y el que manda lo dice **el campo**, no la
     * presencia del otro: `pagina` es el discriminador escrito.
     *
     * · `propia`  → el candidato local del §4, como siempre;
     * · `ninguna` → el `href` **medido**, y sigue siendo un candidato: la regla
     *   de rutas locales se aplica después en el render (`segunEntorno`). Los
     *   que apuntan a una ruta del original que el clon SÍ emite localizan
     *   solos; `?post_type=solutions&p=56674` no es una ruta, así que se queda
     *   verbatim — que es justo lo que la regla dice para un destino sin clonar.
     */
    href: pagina === "ninguna" ? candidatoServido(hrefServido) : `/${[padre, slug].filter(Boolean).join("/")}`,
  };
}

/**
 * Un `href` servido convertido en CANDIDATO local **sólo si es una ruta**.
 * Una URL de consulta (`/?post_type=…`) no tiene ruta que localizar: se
 * devuelve tal cual, y `segunEntorno` la deja pasar por no empezar por `/`…
 * salvo que empiece — por eso se comprueba aquí y no allí.
 */
function candidatoServido(href) {
  if (typeof href !== "string") return href;
  const sinOrigen = href.replace(/^https?:\/\/[^/]+/, "");
  /* Consulta, fragmento o vacío ⇒ no es una ruta: verbatim, con su origen. */
  if (!/^\/[^?#]/.test(sinOrigen)) return href;
  return rutaLocal(href);
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
  /* `candidatoServido` y no `rutaLocal` a secas desde CMS-PR3: los 3 documentos
   * sin página propia pueden traer una URL de CONSULTA, y `rutaLocal` sobre
   * `…/?post_type=solutions&p=56674` devuelve un `/…` que no es ruta de nada.
   * Es la misma función que usa la vuelta, para que no haya dos respuestas. */
  return { ...fila, href: candidatoServido(fila.href) };
}
