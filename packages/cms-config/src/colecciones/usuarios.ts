/**
 * USUARIOS — **infraestructura, no un content type medido.**
 *
 * Se dice en voz alta porque la diferencia importa: las otras 15 colecciones
 * salen de una medición del original y `qa:cms-campos` las empareja campo a
 * campo contra `apps/web/src/lib` y `src/types`. Ésta **no tiene lado medido**,
 * y no puede tenerlo — el original es WordPress y sus usuarios no son contenido
 * del sitio.
 *
 * Existe porque Payload exige **una** colección con `auth: true` para el admin.
 * Vive en el paquete compartido y no en `apps/cms` porque **es esquema de la
 * base de datos**, que las dos apps comparten (CMS-0f), no un componente de
 * admin — la frontera que el acta prohíbe cruzar.
 *
 * Los roles y el control de acceso son de **F2-5** (admin y traspaso). Aquí
 * está el mínimo para que el admin arranque, y nada más: inventar un modelo de
 * permisos ahora sería escribir esquema sin medida ni decisión detrás.
 */
import type { CollectionConfig } from "payload";

export const usuarios: CollectionConfig = {
  slug: "usuarios",
  auth: true,
  admin: { useAsTitle: "email", group: "Sistema" },
  fields: [{ name: "nombre", type: "text" }],
};
