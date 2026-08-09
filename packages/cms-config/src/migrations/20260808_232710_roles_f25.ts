// ⚠ `migrate:create` emite `import { MigrateUpArgs, MigrateDownArgs, sql }`, y
// este paquete compila con `verbatimModuleSyntax`: los dos primeros son TIPOS y
// hay que importarlos como tales. **Hay que rehacerlo en cada migración nueva**
// — no es un arreglo de una vez. Lo caza `npm run check` (typecheck del
// paquete), así que el olvido sale rojo y no se cuela.
//
// QUÉ TRAE ESTA MIGRACIÓN: F2-5 · los roles firmados por el propietario
// (ADMIN + EDITOR). `usuarios.rol` con defecto `editor` — la dirección segura:
// a quien se le olvide elegir le falta poder, no le sobra.
//
// El UPDATE de abajo NO lo emitió `migrate:create`; está a mano y con razón:
// un usuario creado ANTES de que existieran roles tenía todos los poderes
// (no había acceso que negara nada), así que dejarlo en `editor` sería
// RETIRARLE derechos en silencio — y si era el único usuario, dejar la
// instalación sin ningún admin capaz de crear otros. Derivado hoy (2026-08-08):
// la tabla está VACÍA (0 filas, el reset no siembra usuarios), o sea que hoy
// el UPDATE no toca nada — protege a una DB desplegada con usuarios pre-roles.
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_usuarios_rol" AS ENUM('admin', 'editor');
  ALTER TABLE "usuarios" ADD COLUMN "rol" "enum_usuarios_rol" DEFAULT 'editor' NOT NULL;
  UPDATE "usuarios" SET "rol" = 'admin';`)
}

/* El DOWN pierde los roles asignados — es la naturaleza de quitar la columna,
 * no un descuido: no hay dónde guardarlos sin la columna. */
export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "usuarios" DROP COLUMN "rol";
  DROP TYPE "public"."enum_usuarios_rol";`)
}
