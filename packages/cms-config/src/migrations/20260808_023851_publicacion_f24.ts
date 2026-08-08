import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_sectores_estado" AS ENUM('borrador', 'publicado');
  CREATE TYPE "public"."enum_monograficos_estado" AS ENUM('borrador', 'publicado');
  CREATE TYPE "public"."enum_productos_estado" AS ENUM('borrador', 'publicado');
  CREATE TYPE "public"."enum_casos_estado" AS ENUM('borrador', 'publicado');
  CREATE TYPE "public"."enum_faqs_estado" AS ENUM('borrador', 'publicado');
  CREATE TYPE "public"."enum_entradas_blog_estado" AS ENUM('borrador', 'publicado');
  CREATE TYPE "public"."enum_terminos_kunakpedia_estado" AS ENUM('borrador', 'publicado');
  CREATE TYPE "public"."enum_documentos_cientificos_estado" AS ENUM('borrador', 'publicado');
  CREATE TYPE "public"."enum_articulos_kb_estado" AS ENUM('borrador', 'publicado');
  ALTER TABLE "sectores" ADD COLUMN "estado" "enum_sectores_estado" DEFAULT 'borrador' NOT NULL;
  ALTER TABLE "sectores" ADD COLUMN "publicar_en" timestamp(3) with time zone;
  ALTER TABLE "monograficos" ADD COLUMN "estado" "enum_monograficos_estado" DEFAULT 'borrador' NOT NULL;
  ALTER TABLE "monograficos" ADD COLUMN "publicar_en" timestamp(3) with time zone;
  ALTER TABLE "productos" ADD COLUMN "estado" "enum_productos_estado" DEFAULT 'borrador' NOT NULL;
  ALTER TABLE "productos" ADD COLUMN "publicar_en" timestamp(3) with time zone;
  ALTER TABLE "casos" ADD COLUMN "estado" "enum_casos_estado" DEFAULT 'borrador' NOT NULL;
  ALTER TABLE "casos" ADD COLUMN "publicar_en" timestamp(3) with time zone;
  ALTER TABLE "faqs" ADD COLUMN "estado" "enum_faqs_estado" DEFAULT 'borrador' NOT NULL;
  ALTER TABLE "faqs" ADD COLUMN "publicar_en" timestamp(3) with time zone;
  ALTER TABLE "entradas_blog" ADD COLUMN "estado" "enum_entradas_blog_estado" DEFAULT 'borrador' NOT NULL;
  ALTER TABLE "entradas_blog" ADD COLUMN "publicar_en" timestamp(3) with time zone;
  ALTER TABLE "terminos_kunakpedia" ADD COLUMN "estado" "enum_terminos_kunakpedia_estado" DEFAULT 'borrador' NOT NULL;
  ALTER TABLE "terminos_kunakpedia" ADD COLUMN "publicar_en" timestamp(3) with time zone;
  ALTER TABLE "documentos_cientificos" ADD COLUMN "estado" "enum_documentos_cientificos_estado" DEFAULT 'borrador' NOT NULL;
  ALTER TABLE "documentos_cientificos" ADD COLUMN "publicar_en" timestamp(3) with time zone;
  ALTER TABLE "articulos_kb" ADD COLUMN "estado" "enum_articulos_kb_estado" DEFAULT 'borrador' NOT NULL;
  ALTER TABLE "articulos_kb" ADD COLUMN "publicar_en" timestamp(3) with time zone;
  CREATE INDEX "sectores_estado_idx" ON "sectores" USING btree ("estado");
  CREATE INDEX "sectores_publicar_en_idx" ON "sectores" USING btree ("publicar_en");
  CREATE INDEX "monograficos_estado_idx" ON "monograficos" USING btree ("estado");
  CREATE INDEX "monograficos_publicar_en_idx" ON "monograficos" USING btree ("publicar_en");
  CREATE INDEX "productos_estado_idx" ON "productos" USING btree ("estado");
  CREATE INDEX "productos_publicar_en_idx" ON "productos" USING btree ("publicar_en");
  CREATE INDEX "casos_estado_idx" ON "casos" USING btree ("estado");
  CREATE INDEX "casos_publicar_en_idx" ON "casos" USING btree ("publicar_en");
  CREATE INDEX "faqs_estado_idx" ON "faqs" USING btree ("estado");
  CREATE INDEX "faqs_publicar_en_idx" ON "faqs" USING btree ("publicar_en");
  CREATE INDEX "entradas_blog_estado_idx" ON "entradas_blog" USING btree ("estado");
  CREATE INDEX "entradas_blog_publicar_en_idx" ON "entradas_blog" USING btree ("publicar_en");
  CREATE INDEX "terminos_kunakpedia_estado_idx" ON "terminos_kunakpedia" USING btree ("estado");
  CREATE INDEX "terminos_kunakpedia_publicar_en_idx" ON "terminos_kunakpedia" USING btree ("publicar_en");
  CREATE INDEX "documentos_cientificos_estado_idx" ON "documentos_cientificos" USING btree ("estado");
  CREATE INDEX "documentos_cientificos_publicar_en_idx" ON "documentos_cientificos" USING btree ("publicar_en");
  CREATE INDEX "articulos_kb_estado_idx" ON "articulos_kb" USING btree ("estado");
  CREATE INDEX "articulos_kb_publicar_en_idx" ON "articulos_kb" USING btree ("publicar_en");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "sectores_estado_idx";
  DROP INDEX "sectores_publicar_en_idx";
  DROP INDEX "monograficos_estado_idx";
  DROP INDEX "monograficos_publicar_en_idx";
  DROP INDEX "productos_estado_idx";
  DROP INDEX "productos_publicar_en_idx";
  DROP INDEX "casos_estado_idx";
  DROP INDEX "casos_publicar_en_idx";
  DROP INDEX "faqs_estado_idx";
  DROP INDEX "faqs_publicar_en_idx";
  DROP INDEX "entradas_blog_estado_idx";
  DROP INDEX "entradas_blog_publicar_en_idx";
  DROP INDEX "terminos_kunakpedia_estado_idx";
  DROP INDEX "terminos_kunakpedia_publicar_en_idx";
  DROP INDEX "documentos_cientificos_estado_idx";
  DROP INDEX "documentos_cientificos_publicar_en_idx";
  DROP INDEX "articulos_kb_estado_idx";
  DROP INDEX "articulos_kb_publicar_en_idx";
  ALTER TABLE "sectores" DROP COLUMN "estado";
  ALTER TABLE "sectores" DROP COLUMN "publicar_en";
  ALTER TABLE "monograficos" DROP COLUMN "estado";
  ALTER TABLE "monograficos" DROP COLUMN "publicar_en";
  ALTER TABLE "productos" DROP COLUMN "estado";
  ALTER TABLE "productos" DROP COLUMN "publicar_en";
  ALTER TABLE "casos" DROP COLUMN "estado";
  ALTER TABLE "casos" DROP COLUMN "publicar_en";
  ALTER TABLE "faqs" DROP COLUMN "estado";
  ALTER TABLE "faqs" DROP COLUMN "publicar_en";
  ALTER TABLE "entradas_blog" DROP COLUMN "estado";
  ALTER TABLE "entradas_blog" DROP COLUMN "publicar_en";
  ALTER TABLE "terminos_kunakpedia" DROP COLUMN "estado";
  ALTER TABLE "terminos_kunakpedia" DROP COLUMN "publicar_en";
  ALTER TABLE "documentos_cientificos" DROP COLUMN "estado";
  ALTER TABLE "documentos_cientificos" DROP COLUMN "publicar_en";
  ALTER TABLE "articulos_kb" DROP COLUMN "estado";
  ALTER TABLE "articulos_kb" DROP COLUMN "publicar_en";
  DROP TYPE "public"."enum_sectores_estado";
  DROP TYPE "public"."enum_monograficos_estado";
  DROP TYPE "public"."enum_productos_estado";
  DROP TYPE "public"."enum_casos_estado";
  DROP TYPE "public"."enum_faqs_estado";
  DROP TYPE "public"."enum_entradas_blog_estado";
  DROP TYPE "public"."enum_terminos_kunakpedia_estado";
  DROP TYPE "public"."enum_documentos_cientificos_estado";
  DROP TYPE "public"."enum_articulos_kb_estado";`)
}
