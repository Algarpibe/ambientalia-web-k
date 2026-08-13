/**
 * EL ENTORNO DE T10 — qué media está PUBLICADA en `apps/web/public`.
 *
 * Es el gemelo de `rutasConstruidas()` (`packages/cms-config/src/entorno.mjs`)
 * para el otro eje: allí *«¿el clon construye esta RUTA?»*, aquí *«¿el clon
 * sirve este FICHERO?»*. Y por la misma razón vive fuera del módulo puro: T10
 * decide con el entorno, pero `transformaciones.mjs` no toca el disco.
 *
 * ⚠ **Un barrido vacío TIRA** (regla 6, y es la misma línea que ya está escrita
 * en `rutasConstruidas`): devolver un `Set` vacío convertiría *«no pude leer el
 * árbol de media»* en *«no hay nada publicado»*, y T10 saldría **verde
 * habiendo localizado cero**.
 */
import fs from "node:fs";
import path from "node:path";
import { enApp } from "../qa/lib.mjs";

let cache = null;

/**
 * Las rutas relativas a `public/images/uploads`, con `/` como separador y
 * **decodificadas** — que es la forma con la que T10 pregunta.
 *
 * @param {string} [raiz] para el test en negativo: un árbol que no existe.
 */
export function mediaPublicada(raiz = enApp("public", "images", "uploads")) {
  if (cache && cache.raiz === raiz) return cache.set;
  if (!fs.existsSync(raiz))
    throw new Error(
      `mediaPublicada: no existe '${raiz}'.\n` +
        `  Sin árbol no hay entorno, y un entorno vacío dejaría TODA la media del cuerpo\n` +
        `  apuntando a kunakair.com — con T10 en verde por no haber encontrado nada.`,
    );
  const set = new Set();
  const baja = (dir, prefijo) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) baja(path.join(dir, e.name), prefijo ? `${prefijo}/${e.name}` : e.name);
      else set.add(prefijo ? `${prefijo}/${e.name}` : e.name);
    }
  };
  baja(raiz, "");
  if (set.size === 0)
    throw new Error(
      `mediaPublicada: el barrido de '${raiz}' no encontró NINGÚN fichero.\n` +
        `  Eso no es «no hay media publicada»: es que el barrido no está mirando el árbol.`,
    );
  cache = { raiz, set };
  return set;
}
