/**
 * EL CONTROL DE ACCESO — F2-5, roles firmados por el propietario: ADMIN + EDITOR.
 *
 * | rol | puede |
 * |---|---|
 * | **admin** | todo: contenido, publicación, usuarios, registro del sistema |
 * | **editor** | contenido y publicación — SIN usuarios ni configuración |
 *
 * ── Dónde vive y por qué aquí ─────────────────────────────────────────────
 * En el paquete compartido porque es CONFIG DE COLECCIONES, no componente de
 * admin (la frontera de CMS-0f): las mismas funciones guardan el REST del
 * admin y cualquier Local API que pase `overrideAccess: false`.
 *
 * ⚠ **La Local API SIN `overrideAccess: false` se salta todo esto por diseño
 * de Payload.** No es un agujero de esta config: es lo que permite que el
 * seed, los hooks (`registroDeSlug` escribe en `slugs`) y el build del clon
 * sigan funcionando sin usuario. La consecuencia operativa: un proceso con
 * acceso a la DB ya tenía todos los poderes antes de que existieran roles —
 * los roles gobiernan a las PERSONAS (sesiones del admin y REST), y eso es
 * exactamente lo que F2-5 pide. La sonda que lo ejercita: `npm run qa:roles`.
 *
 * ── Por qué `rol` se lee con un cast y no del tipo generado ───────────────
 * `payload-types.ts` se REGENERA desde esta misma config (`cms:types`);
 * importarlo aquí sería leer la salida desde la entrada. El cast declara la
 * forma mínima que estas funciones necesitan y nada más.
 */
import type { Access, PayloadRequest } from "payload";

export type Rol = "admin" | "editor";

/** El rol del usuario de la petición; `undefined` si no hay sesión. */
export const rolDe = (req: PayloadRequest): Rol | undefined =>
  (req.user as { rol?: Rol } | null | undefined)?.rol ?? undefined;

/** Sólo un admin. La ausencia de sesión o de rol NIEGA — no hay valor benigno. */
export const soloAdmin: Access = ({ req }) => rolDe(req) === "admin";

/**
 * Un admin ve/toca todo; cualquier otro usuario, SÓLO su propio documento
 * (la restricción sale como filtro de consulta, que Payload aplica igual al
 * listado y al acceso por id). Sin sesión, nada.
 */
export const adminOUnoMismo: Access = ({ req }) => {
  if (rolDe(req) === "admin") return true;
  if (!req.user) return false;
  return { id: { equals: req.user.id } };
};

/**
 * NADIE por la API — para colecciones que sólo escriben los hooks (`slugs`).
 * Los hooks pasan por Local API sin `overrideAccess: false`, así que esta
 * negación no los toca; a quien niega es a cualquier persona, admin incluido:
 * el registro es estado DERIVADO y editarlo a mano lo desincroniza (§4).
 */
export const nadiePorApi: Access = () => false;
