// ⚠ `migrate:create` emite `import { MigrateUpArgs, MigrateDownArgs, sql }`, y
// este paquete compila con `verbatimModuleSyntax`: los dos primeros son TIPOS y
// hay que importarlos como tales. **Hay que rehacerlo en cada migración nueva**
// — la inicial lo documenta y ésta es la prueba de que sigue haciendo falta.
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_articulos_kb_blocks_blurb_reticula" AS ENUM('iconos', 'col-md-4', 'ninguna');
  CREATE TYPE "public"."enum_articulos_kb_blocks_blurb_alineacion" AS ENUM('center', 'left');
  CREATE TABLE "articulos_kb_blocks_blurb" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"nivel" numeric DEFAULT 3,
  	"imagen_id" integer,
  	"alt" varchar,
  	"descripcion" jsonb,
  	"reticula" "enum_articulos_kb_blocks_blurb_reticula" DEFAULT 'iconos',
  	"alineacion" "enum_articulos_kb_blocks_blurb_alineacion" DEFAULT 'center',
  	"ritmo_mt" numeric,
  	"ritmo_mb" numeric,
  	"ritmo_pt" numeric,
  	"ritmo_pb" numeric,
  	"ritmo_pr" numeric,
  	"ritmo_mb_alterno" boolean,
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "articulos_kb_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"imagen_id" integer NOT NULL,
  	"alt" varchar,
  	"titulo" varchar
  );
  
  CREATE TABLE "articulos_kb_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"ritmo_mt" numeric,
  	"ritmo_mb" numeric,
  	"ritmo_pt" numeric,
  	"ritmo_pb" numeric,
  	"ritmo_pr" numeric,
  	"ritmo_mb_alterno" boolean,
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  ALTER TABLE "articulos_kb" ADD COLUMN "prefijo" varchar NOT NULL;
  ALTER TABLE "articulos_kb_blocks_blurb" ADD CONSTRAINT "articulos_kb_blocks_blurb_imagen_id_media_id_fk" FOREIGN KEY ("imagen_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articulos_kb_blocks_blurb" ADD CONSTRAINT "articulos_kb_blocks_blurb_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_kb_blocks_gallery_items" ADD CONSTRAINT "articulos_kb_blocks_gallery_items_imagen_id_media_id_fk" FOREIGN KEY ("imagen_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articulos_kb_blocks_gallery_items" ADD CONSTRAINT "articulos_kb_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_kb_blocks_gallery" ADD CONSTRAINT "articulos_kb_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "articulos_kb_blocks_blurb_order_idx" ON "articulos_kb_blocks_blurb" USING btree ("_order");
  CREATE INDEX "articulos_kb_blocks_blurb_parent_id_idx" ON "articulos_kb_blocks_blurb" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_blocks_blurb_path_idx" ON "articulos_kb_blocks_blurb" USING btree ("_path");
  CREATE INDEX "articulos_kb_blocks_blurb_imagen_idx" ON "articulos_kb_blocks_blurb" USING btree ("imagen_id");
  CREATE INDEX "articulos_kb_blocks_gallery_items_order_idx" ON "articulos_kb_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "articulos_kb_blocks_gallery_items_parent_id_idx" ON "articulos_kb_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_blocks_gallery_items_imagen_idx" ON "articulos_kb_blocks_gallery_items" USING btree ("imagen_id");
  CREATE INDEX "articulos_kb_blocks_gallery_order_idx" ON "articulos_kb_blocks_gallery" USING btree ("_order");
  CREATE INDEX "articulos_kb_blocks_gallery_parent_id_idx" ON "articulos_kb_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_blocks_gallery_path_idx" ON "articulos_kb_blocks_gallery" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "articulos_kb_blocks_blurb" CASCADE;
  DROP TABLE "articulos_kb_blocks_gallery_items" CASCADE;
  DROP TABLE "articulos_kb_blocks_gallery" CASCADE;
  ALTER TABLE "articulos_kb" DROP COLUMN "prefijo";
  DROP TYPE "public"."enum_articulos_kb_blocks_blurb_reticula";
  DROP TYPE "public"."enum_articulos_kb_blocks_blurb_alineacion";`)
}
