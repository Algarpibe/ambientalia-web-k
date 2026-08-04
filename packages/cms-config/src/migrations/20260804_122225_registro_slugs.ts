// Ver la nota de `20260804_120654_inicial.ts`: `verbatimModuleSyntax` obliga a
// importar los dos primeros como tipos, y `migrate:create` no lo hace.
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "slugs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"familia" varchar NOT NULL,
  	"documento" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "slugs_id" integer;
  CREATE UNIQUE INDEX "slugs_slug_idx" ON "slugs" USING btree ("slug");
  CREATE INDEX "slugs_familia_idx" ON "slugs" USING btree ("familia");
  CREATE INDEX "slugs_documento_idx" ON "slugs" USING btree ("documento");
  CREATE INDEX "slugs_updated_at_idx" ON "slugs" USING btree ("updated_at");
  CREATE INDEX "slugs_created_at_idx" ON "slugs" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_slugs_fk" FOREIGN KEY ("slugs_id") REFERENCES "public"."slugs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_slugs_id_idx" ON "payload_locked_documents_rels" USING btree ("slugs_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "slugs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "slugs" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_slugs_fk";
  
  DROP INDEX "payload_locked_documents_rels_slugs_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "slugs_id";`)
}
