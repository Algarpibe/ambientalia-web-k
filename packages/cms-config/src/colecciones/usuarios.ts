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
 * ── Los ROLES (F2-5, firmados por el propietario): ADMIN + EDITOR ─────────
 * El modelo entero está en `acceso.ts`. Lo que esta colección aporta:
 *
 *   · `rol` — select `admin` | `editor`, con defecto **editor** (la dirección
 *     segura: a quien se le olvide elegir le falta poder, no le sobra). El
 *     PRIMER usuario de una DB vacía entra por el flujo create-first-user de
 *     Payload, que esquiva el `create` de abajo por diseño — **elígele
 *     `admin`**, está dicho también en la doc de traspaso;
 *   · acceso: crear/borrar usuarios es de admin; leer y editar, admin o UNO
 *     MISMO (un editor gestiona su nombre y su clave, nada más);
 *   · **la guarda del rol es un hook y TIRA, no un `access` de campo**: un
 *     `access.update` de campo que niega hace que Payload DESCARTE el campo
 *     en silencio — el editor guardaría «rol: admin», leería un 200 y el rol
 *     no habría cambiado. Silencioso es exactamente lo que una guarda no
 *     puede ser (regla 6): aquí la escalada FALLA con su mensaje.
 *
 * Falsadores: `npm run qa:roles-neg` (sin-acceso · sin-guarda-rol · control).
 */
import type { CollectionBeforeChangeHook, CollectionConfig } from "payload";
import { adminOUnoMismo, rolDe, soloAdmin } from "../acceso.ts";

/**
 * Sin sesión no hay escalada que guardar: los procesos (seed, sondas, scripts
 * de operación) entran por Local API sin usuario y tienen que poder poner
 * roles — es como se crea el primer admin por script si hiciera falta.
 */
const guardaRol: CollectionBeforeChangeHook = ({ req, data, originalDoc, operation }) => {
  if (!req.user || rolDe(req) === "admin") return data;
  const cambia = operation === "update" && data?.rol !== undefined && data.rol !== originalDoc?.rol;
  if (cambia)
    throw new Error(
      "SOLO UN ADMIN CAMBIA ROLES. Tu sesión es de editor y el rol no es un campo tuyo: " +
        "pídeselo a un admin. (F2-5 · qa:roles invariante 4)",
    );
  return data;
};

export const usuarios: CollectionConfig = {
  slug: "usuarios",
  auth: true,
  access: {
    read: adminOUnoMismo,
    create: soloAdmin,
    update: adminOUnoMismo,
    delete: soloAdmin,
    unlock: soloAdmin,
  },
  admin: {
    useAsTitle: "email",
    group: "Sistema",
    defaultColumns: ["email", "nombre", "rol"],
    /* Cosmética, NO la guarda: esconde la colección del menú de un editor.
     * El invariante es el `access` de arriba, y lo mide `qa:roles`. */
    hidden: ({ user }) => (user as { rol?: string } | null)?.rol !== "admin",
  },
  hooks: { beforeChange: [guardaRol] },
  fields: [
    { name: "nombre", type: "text" },
    {
      name: "rol",
      type: "select",
      required: true,
      defaultValue: "editor",
      saveToJWT: true,
      options: [
        { label: "Admin — contenido, usuarios y sistema", value: "admin" },
        { label: "Editor — contenido y publicación", value: "editor" },
      ],
      admin: {
        description:
          "Editor: edita y publica contenido. Admin: además gestiona usuarios y ve el registro del sistema. " +
          "Sólo un admin puede cambiar este campo.",
      },
    },
  ],
};
