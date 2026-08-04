// ⚠ `migrate:create` emite `import { MigrateUpArgs, MigrateDownArgs, sql }`, y
// este paquete compila con `verbatimModuleSyntax`: los dos primeros son TIPOS y
// hay que importarlos como tales. **Hay que rehacerlo en cada migración nueva**
// — no es un arreglo de una vez. Lo caza `npm run check` (typecheck del
// paquete), así que el olvido sale rojo y no se cuela.
//
// QUÉ TRAE ESTA MIGRACIÓN: la decisión §F2-2 · TEASER. `proyectos.posts` y
// `articulos.posts` dejan de ser relaciones (`sectores_rels` / `monograficos_rels`)
// y pasan a ser tablas de array con los campos del teaser medido. Ver el acta en
// `campos/comunes.ts` y el falsador ejecutable en `npm run qa:cms-teaser`.
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "sectores_proyectos_posts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"client" varchar NOT NULL,
  	"sector" varchar NOT NULL,
  	"sector_href" varchar,
  	"title" varchar NOT NULL,
  	"image_id" integer NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "sectores_articulos_posts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"date" varchar NOT NULL,
  	"image_id" integer NOT NULL,
  	"href" varchar NOT NULL,
  	"excerpt" varchar
  );
  
  CREATE TABLE "monograficos_proyectos_posts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"client" varchar NOT NULL,
  	"sector" varchar NOT NULL,
  	"sector_href" varchar,
  	"title" varchar NOT NULL,
  	"image_id" integer NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "monograficos_articulos_posts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"date" varchar NOT NULL,
  	"image_id" integer NOT NULL,
  	"href" varchar NOT NULL,
  	"excerpt" varchar
  );
  
  ALTER TABLE "sectores_rels" DROP CONSTRAINT "sectores_rels_casos_fk";
  
  ALTER TABLE "sectores_rels" DROP CONSTRAINT "sectores_rels_entradas_blog_fk";
  
  ALTER TABLE "monograficos_rels" DROP CONSTRAINT "monograficos_rels_casos_fk";
  
  ALTER TABLE "monograficos_rels" DROP CONSTRAINT "monograficos_rels_entradas_blog_fk";
  
  DROP INDEX "sectores_rels_casos_id_idx";
  DROP INDEX "sectores_rels_entradas_blog_id_idx";
  DROP INDEX "monograficos_rels_casos_id_idx";
  DROP INDEX "monograficos_rels_entradas_blog_id_idx";
  ALTER TABLE "sectores_proyectos_posts" ADD CONSTRAINT "sectores_proyectos_posts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sectores_proyectos_posts" ADD CONSTRAINT "sectores_proyectos_posts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectores_articulos_posts" ADD CONSTRAINT "sectores_articulos_posts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sectores_articulos_posts" ADD CONSTRAINT "sectores_articulos_posts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sectores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_proyectos_posts" ADD CONSTRAINT "monograficos_proyectos_posts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "monograficos_proyectos_posts" ADD CONSTRAINT "monograficos_proyectos_posts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_articulos_posts" ADD CONSTRAINT "monograficos_articulos_posts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "monograficos_articulos_posts" ADD CONSTRAINT "monograficos_articulos_posts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "sectores_proyectos_posts_order_idx" ON "sectores_proyectos_posts" USING btree ("_order");
  CREATE INDEX "sectores_proyectos_posts_parent_id_idx" ON "sectores_proyectos_posts" USING btree ("_parent_id");
  CREATE INDEX "sectores_proyectos_posts_image_idx" ON "sectores_proyectos_posts" USING btree ("image_id");
  CREATE INDEX "sectores_articulos_posts_order_idx" ON "sectores_articulos_posts" USING btree ("_order");
  CREATE INDEX "sectores_articulos_posts_parent_id_idx" ON "sectores_articulos_posts" USING btree ("_parent_id");
  CREATE INDEX "sectores_articulos_posts_image_idx" ON "sectores_articulos_posts" USING btree ("image_id");
  CREATE INDEX "monograficos_proyectos_posts_order_idx" ON "monograficos_proyectos_posts" USING btree ("_order");
  CREATE INDEX "monograficos_proyectos_posts_parent_id_idx" ON "monograficos_proyectos_posts" USING btree ("_parent_id");
  CREATE INDEX "monograficos_proyectos_posts_image_idx" ON "monograficos_proyectos_posts" USING btree ("image_id");
  CREATE INDEX "monograficos_articulos_posts_order_idx" ON "monograficos_articulos_posts" USING btree ("_order");
  CREATE INDEX "monograficos_articulos_posts_parent_id_idx" ON "monograficos_articulos_posts" USING btree ("_parent_id");
  CREATE INDEX "monograficos_articulos_posts_image_idx" ON "monograficos_articulos_posts" USING btree ("image_id");
  ALTER TABLE "sectores_rels" DROP COLUMN "casos_id";
  ALTER TABLE "sectores_rels" DROP COLUMN "entradas_blog_id";
  ALTER TABLE "monograficos_rels" DROP COLUMN "casos_id";
  ALTER TABLE "monograficos_rels" DROP COLUMN "entradas_blog_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sectores_proyectos_posts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sectores_articulos_posts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "monograficos_proyectos_posts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "monograficos_articulos_posts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "sectores_proyectos_posts" CASCADE;
  DROP TABLE "sectores_articulos_posts" CASCADE;
  DROP TABLE "monograficos_proyectos_posts" CASCADE;
  DROP TABLE "monograficos_articulos_posts" CASCADE;
  ALTER TABLE "sectores_rels" ADD COLUMN "casos_id" integer;
  ALTER TABLE "sectores_rels" ADD COLUMN "entradas_blog_id" integer;
  ALTER TABLE "monograficos_rels" ADD COLUMN "casos_id" integer;
  ALTER TABLE "monograficos_rels" ADD COLUMN "entradas_blog_id" integer;
  ALTER TABLE "sectores_rels" ADD CONSTRAINT "sectores_rels_casos_fk" FOREIGN KEY ("casos_id") REFERENCES "public"."casos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sectores_rels" ADD CONSTRAINT "sectores_rels_entradas_blog_fk" FOREIGN KEY ("entradas_blog_id") REFERENCES "public"."entradas_blog"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_rels" ADD CONSTRAINT "monograficos_rels_casos_fk" FOREIGN KEY ("casos_id") REFERENCES "public"."casos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "monograficos_rels" ADD CONSTRAINT "monograficos_rels_entradas_blog_fk" FOREIGN KEY ("entradas_blog_id") REFERENCES "public"."entradas_blog"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "sectores_rels_casos_id_idx" ON "sectores_rels" USING btree ("casos_id");
  CREATE INDEX "sectores_rels_entradas_blog_id_idx" ON "sectores_rels" USING btree ("entradas_blog_id");
  CREATE INDEX "monograficos_rels_casos_id_idx" ON "monograficos_rels" USING btree ("casos_id");
  CREATE INDEX "monograficos_rels_entradas_blog_id_idx" ON "monograficos_rels" USING btree ("entradas_blog_id");`)
}
