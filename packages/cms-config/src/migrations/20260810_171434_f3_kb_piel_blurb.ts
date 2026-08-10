/**
 * F3-1 · LA PIEL DEL TITULAR DE BLURB — **un grupo, no un array**, porque Divi
 * da UN control aquí (el nivel es un ajuste aparte, y por eso lo compila contra
 * `.et_pb_module_header` y no contra `h4`).
 *
 * Va en migración propia y no dentro de la anterior porque **llegó por otra
 * medición**: la primera versión de `qa:pieles` informó *«0 overrides en
 * `blurb`»* y contradecía a `modulos.spec.md` §2, que tenía **tres pieles**
 * medidas. Ganó la spec: fallaba el selector de la sonda.
 *
 * ⚠ `import type` — ver la nota de `20260810_164348_f3_kb_piel_titular.ts`.
 */
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_articulos_kb_blocks_blurb_piel_align" AS ENUM('left', 'center', 'right', 'justify');
  ALTER TABLE "articulos_kb_blocks_blurb" ADD COLUMN "piel_fs" numeric;
  ALTER TABLE "articulos_kb_blocks_blurb" ADD COLUMN "piel_lh" numeric;
  ALTER TABLE "articulos_kb_blocks_blurb" ADD COLUMN "piel_fw" numeric;
  ALTER TABLE "articulos_kb_blocks_blurb" ADD COLUMN "piel_color" varchar;
  ALTER TABLE "articulos_kb_blocks_blurb" ADD COLUMN "piel_align" "enum_articulos_kb_blocks_blurb_piel_align";
  ALTER TABLE "articulos_kb_blocks_blurb" ADD COLUMN "piel_movil_fs" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articulos_kb_blocks_blurb" DROP COLUMN "piel_fs";
  ALTER TABLE "articulos_kb_blocks_blurb" DROP COLUMN "piel_lh";
  ALTER TABLE "articulos_kb_blocks_blurb" DROP COLUMN "piel_fw";
  ALTER TABLE "articulos_kb_blocks_blurb" DROP COLUMN "piel_color";
  ALTER TABLE "articulos_kb_blocks_blurb" DROP COLUMN "piel_align";
  ALTER TABLE "articulos_kb_blocks_blurb" DROP COLUMN "piel_movil_fs";
  DROP TYPE "public"."enum_articulos_kb_blocks_blurb_piel_align";`)
}
