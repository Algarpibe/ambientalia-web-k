import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "ruta_origen" varchar;
  CREATE UNIQUE INDEX "media_ruta_origen_idx" ON "media" USING btree ("ruta_origen");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "media_ruta_origen_idx";
  ALTER TABLE "media" DROP COLUMN "ruta_origen";`)
}
