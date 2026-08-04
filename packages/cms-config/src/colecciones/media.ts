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
import type { CollectionConfig } from "payload";
import { IMAGE_SIZES } from "../defaults.ts";

export const media: CollectionConfig = {
  slug: "media",
  admin: { group: "Media" },
  upload: {
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
