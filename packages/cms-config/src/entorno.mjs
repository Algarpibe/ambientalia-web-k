/**
 * EL ENTORNO DE RUTAS — la regla de rutas locales de `CLAUDE.md`, aplicada al
 * `href` que la vuelta COMPONE. Cierra `PENDIENTES-QA.md` §F2-3-HREF-DERIVADO
 * por su salida (b).
 *
 * ── El defecto que corrige, con su número ─────────────────────────────────
 * §4 no guarda `href`: `devuelveProducto` lo recompone `padre` + `slug`,
 * **local para los 9**. El dato medido trae 3 locales y 6 absolutas al
 * original, así que 6 de 9 pasaban a apuntar a una ruta que el build no emite
 * (`qa:tipo-hoja`, eje `href`; −24 por producto en la carga RSC de 3 rutas).
 *
 * ── Por qué la decisión NO va en el dato ni en la vuelta ──────────────────
 * El `href` bueno depende de *qué está clonado*, que es ENTORNO y cambia cada
 * tanda. Guardarlo (salida a) obligaría a re-migrar los 24 productos con cada
 * página clonada; decidirlo en la vuelta rompería su pureza y el round-trip.
 * Así que la vuelta sigue componiendo el CANDIDATO local, y la regla se aplica
 * en el render (el proyector de `apps/web`) con la lista derivada de aquí.
 *
 * ── De dónde sale «construido», y por qué del árbol y no del manifiesto ───
 * El `prerender-manifest` es la SALIDA del build, y este código corre DENTRO
 * del build que lo produce — con el publicador construyendo en un `dist`
 * limpio, a la hora de renderizar no hay manifiesto que leer. Lo que determina
 * las rutas estáticas del manifiesto es el árbol de `app/`: se deriva de ahí,
 * que es derivar del mismo sitio del que el build deriva las suyas — no una
 * lista a mano. El lazo lo cierra `qa:tipo-hoja` DESPUÉS del build: contrasta
 * lo compuesto contra el manifiesto real, así que una divergencia entre árbol
 * y manifiesto (p. ej. una futura ruta dinámica de producto) sale por rojo,
 * no por silencio.
 *
 * ⚠ Un producto construido sólo puede serlo por PÁGINA PROPIA (estática): las
 * rutas dinámicas del clon sirven otras familias, y un producto en `/[slug]`
 * sería una colisión que la guarda del §4 rechaza. Por eso basta el barrido
 * estático — y si un día deja de bastar, es `qa:tipo-hoja` quien lo dice.
 */
import fs from "node:fs";
import path from "node:path";

/** El origen del sitio original, sin barra final. */
export const ORIGEN = "https://kunakair.com/es";

/**
 * Las colecciones cuyo `DEVUELVE` compone una ruta local (§4). Vive aquí, al
 * lado de la regla que la consume; hoy es sólo `productos`, y quien añada un
 * compositor de ruta a `vuelta.mjs` tiene que añadirlo aquí y darle eje en
 * `qa:tipo-hoja` — sin guarda, su `href` repetiría este defecto.
 */
export const COMPONEN_RUTA = new Set(["productos"]);

/**
 * La regla, pura sobre (candidato, entorno): destino construido → ruta local;
 * no construido → el original, hasta que se clone. La forma del original es la
 * inversa exacta de `rutaLocal` (vuelta.mjs): origen + `/es` + ruta + barra
 * final — los −24 de la ficha, deshechos.
 */
export function hrefSegunEntorno(href, construidas) {
  if (typeof href !== "string" || !href.startsWith("/")) return href;
  if (!(construidas instanceof Set))
    throw new Error("hrefSegunEntorno: `construidas` tiene que ser un Set — sin entorno no hay regla que aplicar");
  return construidas.has(href) ? href : `${ORIGEN}${href}/`;
}

/**
 * Las rutas ESTÁTICAS que el árbol de `app/` emite: un `page.tsx` por debajo
 * de segmentos sin `[…]`. Los grupos `(…)` no añaden segmento; un subárbol
 * con segmento dinámico se descarta entero (su ruta no es estática).
 *
 * Regla 6 y regla del cero: un directorio ausente o un barrido que no
 * encuentra NINGUNA página TIRAN — devolver un Set vacío convertiría «no pude
 * derivar el entorno» en «nada está clonado», y todos los productos saldrían
 * al original en silencio (el mismo verde falso que `sin-manifiesto` caza en
 * `cms-arquetipos`).
 */
export function rutasConstruidas(appDir) {
  if (!appDir || !fs.existsSync(appDir))
    throw new Error(
      `rutasConstruidas: no existe el directorio de app '${appDir}'.\n` +
        `  Sin árbol no hay entorno, y un entorno vacío mandaría TODOS los href al original.`,
    );
  const rutas = new Set();
  const baja = (dir, segmentos) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) {
        if (e.name.startsWith("[")) continue; // dinámico: el subárbol entero no es estático
        baja(path.join(dir, e.name), e.name.startsWith("(") ? segmentos : [...segmentos, e.name]);
      } else if (e.name === "page.tsx" || e.name === "page.ts") {
        rutas.add(`/${segmentos.join("/")}` === "/" ? "/" : `/${segmentos.join("/")}`);
      }
    }
  };
  baja(appDir, []);
  if (rutas.size === 0)
    throw new Error(
      `rutasConstruidas: el barrido de '${appDir}' no encontró NINGÚN page.tsx.\n` +
        `  Eso no es «nada está clonado»: es que el barrido no está mirando el árbol del app.`,
    );
  return rutas;
}
