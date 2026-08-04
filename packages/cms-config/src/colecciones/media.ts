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
  ],
};
