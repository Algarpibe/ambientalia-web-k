/**
 * 117.ª · ESCALÓN 2 — `autores` (colección SIN archivo) y `entradas_blog_firmas`.
 *
 * ⚠⚠ **EL `down` GENERADO NO REVERTÍA, Y SE VIO PORQUE SE PROBÓ ANTES DE
 * SEMBRAR (§regla 30).** Payload emite, en este orden:
 *
 *     DROP TABLE "autores" CASCADE;
 *     ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "…_autores_fk";
 *
 * y el `CASCADE` **ya se ha llevado esa constraint**, así que la línea
 * siguiente falla con *«constraint … does not exist»* y la reversa entera hace
 * rollback. Corregido añadiendo `IF EXISTS` a las cuatro sentencias de
 * desmontaje — no se reordena el SQL generado: se le quita la suposición de
 * que el objeto sigue ahí.
 *
 * **Y la ventana era ésta y sólo ésta.** Una reversa que borra tablas sólo
 * puede comprobarse mientras no haya filas que dependan de ellas; después, lo
 * único medible es que falla, y eso ya no distingue *«la migración está bien
 * escrita»* de *«está mal escrita»*. Verificado **tabla a tabla** —134 líneas,
 * `diff` sin salida— y no con el total, que es lo que §regla 30 pide: dos
 * tablas compensándose dan el mismo número.
 */
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_entradas_blog_firmas_papel" AS ENUM('escrito', 'revisado');
  CREATE TABLE "entradas_blog_firmas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"autor_id" integer NOT NULL,
  	"papel" "enum_entradas_blog_firmas_papel" DEFAULT 'escrito' NOT NULL,
  	"proemio" varchar
  );
  
  CREATE TABLE "autores_redes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"red" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "autores" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"nombre" varchar NOT NULL,
  	"foto_id" integer,
  	"foto_origen" varchar,
  	"cargo" varchar,
  	"bio" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "autores_id" integer;
  ALTER TABLE "entradas_blog_firmas" ADD CONSTRAINT "entradas_blog_firmas_autor_id_autores_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."autores"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "entradas_blog_firmas" ADD CONSTRAINT "entradas_blog_firmas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."entradas_blog"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "autores_redes" ADD CONSTRAINT "autores_redes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."autores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "autores" ADD CONSTRAINT "autores_foto_id_media_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "entradas_blog_firmas_order_idx" ON "entradas_blog_firmas" USING btree ("_order");
  CREATE INDEX "entradas_blog_firmas_parent_id_idx" ON "entradas_blog_firmas" USING btree ("_parent_id");
  CREATE INDEX "entradas_blog_firmas_autor_idx" ON "entradas_blog_firmas" USING btree ("autor_id");
  CREATE INDEX "autores_redes_order_idx" ON "autores_redes" USING btree ("_order");
  CREATE INDEX "autores_redes_parent_id_idx" ON "autores_redes" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "autores_slug_idx" ON "autores" USING btree ("slug");
  CREATE INDEX "autores_foto_idx" ON "autores" USING btree ("foto_id");
  CREATE INDEX "autores_updated_at_idx" ON "autores" USING btree ("updated_at");
  CREATE INDEX "autores_created_at_idx" ON "autores" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_autores_fk" FOREIGN KEY ("autores_id") REFERENCES "public"."autores"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_autores_id_idx" ON "payload_locked_documents_rels" USING btree ("autores_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "entradas_blog_firmas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "autores_redes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "autores" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "entradas_blog_firmas" CASCADE;
  DROP TABLE "autores_redes" CASCADE;
  DROP TABLE "autores" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_autores_fk";

  DROP INDEX IF EXISTS "payload_locked_documents_rels_autores_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "autores_id";
  DROP TYPE IF EXISTS "public"."enum_entradas_blog_firmas_papel";`)
}
