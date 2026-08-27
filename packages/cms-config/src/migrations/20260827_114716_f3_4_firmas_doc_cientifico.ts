import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_documentos_cientificos_firmas_papel" AS ENUM('escrito', 'revisado');
  CREATE TABLE "documentos_cientificos_firmas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"autor_id" integer NOT NULL,
  	"papel" "enum_documentos_cientificos_firmas_papel" DEFAULT 'escrito' NOT NULL,
  	"proemio" varchar
  );
  
  ALTER TABLE "documentos_cientificos_firmas" ADD CONSTRAINT "documentos_cientificos_firmas_autor_id_autores_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."autores"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "documentos_cientificos_firmas" ADD CONSTRAINT "documentos_cientificos_firmas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."documentos_cientificos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "documentos_cientificos_firmas_order_idx" ON "documentos_cientificos_firmas" USING btree ("_order");
  CREATE INDEX "documentos_cientificos_firmas_parent_id_idx" ON "documentos_cientificos_firmas" USING btree ("_parent_id");
  CREATE INDEX "documentos_cientificos_firmas_autor_idx" ON "documentos_cientificos_firmas" USING btree ("autor_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "documentos_cientificos_firmas" CASCADE;
  DROP TYPE IF EXISTS "public"."enum_documentos_cientificos_firmas_papel";`)
}
