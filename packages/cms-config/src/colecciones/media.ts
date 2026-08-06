/**
 * MEDIA — CMS-0b, y **los image sizes son la mitad medida de la decisión**.
 *
 * §CMS-0b («Media en VOLUMEN PERSISTENTE del VPS») dejó los tamaños medidos y
 * `defaults.ts` los guarda con su procedencia. Declararlos aquí es lo que hace
 * que ese defecto esté **conectado** y no solo documentado: una lista de anchos
 * que ningún `imageSizes` consume es un número en un comentario.
 *
 * Los `848` y `1800` del inventario **no entran**: son tamaño nativo, no
 * variante.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { CollectionConfig } from "payload";
import { IMAGE_SIZES } from "../defaults.ts";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * ⚠ **DÓNDE aterrizan los ficheros, DECLARADO — y no era un detalle.**
 *
 * Sin `staticDir`, Payload resuelve `media` **contra el `cwd`**, así que el
 * mismo seed escribe en un sitio distinto según desde dónde se lance: la raíz
 * si va por `npm run`, `apps/cms/` si va por `npx payload`. Un dato que cambia
 * de sitio con quien lo invoca no es determinista, y el determinismo del seed
 * es literalmente lo que hace alcanzable el Δ0 de F2-3 (§F2-2).
 *
 * Se ancla al PAQUETE —que sabe dónde está— y se deja sobreescribir por
 * `MEDIA_DIR`, que es por donde entrará el **volumen persistente** de CMS-0b
 * cuando F2-4 despliegue. No hay defecto silencioso: si `MEDIA_DIR` no está,
 * la ruta anclada es una decisión, no un accidente del `cwd`.
 */
export const DIR_MEDIA = process.env.MEDIA_DIR ?? path.resolve(dirname, "../../../../media");

export const media: CollectionConfig = {
  slug: "media",
  admin: { group: "Media" },
  upload: {
    staticDir: DIR_MEDIA,
    imageSizes: IMAGE_SIZES.valor.map((s) => ({
      name: s.nombre,
      width: s.width,
      ...("height" in s ? { height: s.height } : {}),
    })),
  },
  fields: [
    // El `alt` por fichero. Donde el tipo medido lo trae por USO
    // (`SectorImage.alt`, `CasoImagen.alt`, `ImagenA.alt`) el campo de uso
    // manda y éste es el defecto — C-SP10 midió que dentro de un caso el alt es
    // constante, o sea que la mayoría de las veces coinciden.
    { name: "alt", type: "text" },
    /**
     * ⚠ **CMS-0g (2026-08-06) · campo de PROCEDENCIA, no de contenido.**
     *
     * La ruta con la que el seed subió este fichero: `/images/uploads/2024/03/
     * x.jpg`. Payload guarda el **nombre**, no el directorio, así que sin esto
     * la vuelta (`aMedido` → `ctx.rutaDeMedia`) no puede reconstruir la cadena
     * que el clon renderiza, y el Δ0 de F2-3 no es alcanzable.
     *
     * **Y no se cierra tabulando sobre `filename`, aunque hoy funcionaría.**
     * `qa:media-colision` lo midió: el dominio de hoy son **112 rutas con 0
     * basenames repetidos**, pero la unión con el corpus —lo que alguna vez
     * podrá ser fila— tiene **1**, con 12 referencias. O sea que la tabla
     * funciona hoy y se rompe con contenido dentro, que es la dirección cara:
     * la procedencia **sólo es conocible mientras el seed sea la única fuente**.
     * Acta con las tres salidas costadas en `ESQUEMA-CMS.md` §7c.
     *
     * Las cuatro propiedades salen de la NATURALEZA del campo, no del gusto:
     *
     *   · `required: false` — **por construcción**: un alta desde `/admin` no
     *     tiene origen. Exigirlo sería un esquema roto en producción.
     *   · `readOnly` — es un registro de migración, no algo que el editor
     *     redacte. Editable movería el render sin que nadie edite contenido.
     *   · `unique` — dos filas reclamando el mismo origen es un defecto del
     *     seed (`ctx.media` ya memoiza por ruta). En Postgres el `unique`
     *     nullable admite muchos `NULL`, que es lo que los altas necesitan.
     *   · `index` — es la llave por la que se consulta.
     */
    {
      name: "rutaOrigen",
      type: "text",
      required: false,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description:
          "Procedencia: la ruta con la que la migración subió este fichero (/images/…). " +
          "Vacío en las altas hechas desde el admin, que no tienen origen — y entonces el " +
          "render usa /api/media/file/<filename>, la única URL que puede funcionar para ellas.",
      },
    },
  ],
};
