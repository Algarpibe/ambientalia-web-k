// ⚠ `migrate:create` emite `import { MigrateUpArgs, MigrateDownArgs, sql }`, y
// este paquete compila con `verbatimModuleSyntax`: los dos primeros son TIPOS y
// hay que importarlos como tales. **Hay que rehacerlo en cada migración nueva.**
import type { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres"
import { sql } from "@payloadcms/db-postgres"

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "articulos_kb_blocks_imagen" CASCADE;
  DROP TABLE "articulos_kb_blocks_boton" CASCADE;
  ALTER TABLE "articulos_kb_blocks_texto_kb" DROP COLUMN "ritmo_mt";
  ALTER TABLE "articulos_kb_blocks_texto_kb" DROP COLUMN "ritmo_mb";
  ALTER TABLE "articulos_kb_blocks_texto_kb" DROP COLUMN "ritmo_pt";
  ALTER TABLE "articulos_kb_blocks_texto_kb" DROP COLUMN "ritmo_pb";
  ALTER TABLE "articulos_kb_blocks_texto_kb" DROP COLUMN "ritmo_pr";
  ALTER TABLE "articulos_kb_blocks_texto_kb" DROP COLUMN "ritmo_mb_alterno";
  ALTER TABLE "articulos_kb_blocks_texto_kb" DROP COLUMN "ancho_pct";
  ALTER TABLE "articulos_kb_blocks_blurb" DROP COLUMN "ritmo_mt";
  ALTER TABLE "articulos_kb_blocks_blurb" DROP COLUMN "ritmo_mb";
  ALTER TABLE "articulos_kb_blocks_blurb" DROP COLUMN "ritmo_pt";
  ALTER TABLE "articulos_kb_blocks_blurb" DROP COLUMN "ritmo_pb";
  ALTER TABLE "articulos_kb_blocks_blurb" DROP COLUMN "ritmo_pr";
  ALTER TABLE "articulos_kb_blocks_blurb" DROP COLUMN "ritmo_mb_alterno";
  ALTER TABLE "articulos_kb_blocks_blurb" DROP COLUMN "ancho_pct";
  ALTER TABLE "articulos_kb_blocks_gallery" DROP COLUMN "ritmo_mt";
  ALTER TABLE "articulos_kb_blocks_gallery" DROP COLUMN "ritmo_mb";
  ALTER TABLE "articulos_kb_blocks_gallery" DROP COLUMN "ritmo_pt";
  ALTER TABLE "articulos_kb_blocks_gallery" DROP COLUMN "ritmo_pb";
  ALTER TABLE "articulos_kb_blocks_gallery" DROP COLUMN "ritmo_pr";
  ALTER TABLE "articulos_kb_blocks_gallery" DROP COLUMN "ritmo_mb_alterno";
  ALTER TABLE "articulos_kb_blocks_gallery" DROP COLUMN "ancho_pct";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "articulos_kb_blocks_imagen" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src_id" integer NOT NULL,
  	"alt" varchar,
  	"ritmo_mt" numeric,
  	"ritmo_mb" numeric,
  	"ritmo_pt" numeric,
  	"ritmo_pb" numeric,
  	"ritmo_pr" numeric,
  	"ritmo_mb_alterno" boolean,
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "articulos_kb_blocks_boton" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"external" boolean,
  	"block_name" varchar
  );
  
  ALTER TABLE "articulos_kb_blocks_texto_kb" ADD COLUMN "ritmo_mt" numeric;
  ALTER TABLE "articulos_kb_blocks_texto_kb" ADD COLUMN "ritmo_mb" numeric;
  ALTER TABLE "articulos_kb_blocks_texto_kb" ADD COLUMN "ritmo_pt" numeric;
  ALTER TABLE "articulos_kb_blocks_texto_kb" ADD COLUMN "ritmo_pb" numeric;
  ALTER TABLE "articulos_kb_blocks_texto_kb" ADD COLUMN "ritmo_pr" numeric;
  ALTER TABLE "articulos_kb_blocks_texto_kb" ADD COLUMN "ritmo_mb_alterno" boolean;
  ALTER TABLE "articulos_kb_blocks_texto_kb" ADD COLUMN "ancho_pct" numeric DEFAULT 100;
  ALTER TABLE "articulos_kb_blocks_blurb" ADD COLUMN "ritmo_mt" numeric;
  ALTER TABLE "articulos_kb_blocks_blurb" ADD COLUMN "ritmo_mb" numeric;
  ALTER TABLE "articulos_kb_blocks_blurb" ADD COLUMN "ritmo_pt" numeric;
  ALTER TABLE "articulos_kb_blocks_blurb" ADD COLUMN "ritmo_pb" numeric;
  ALTER TABLE "articulos_kb_blocks_blurb" ADD COLUMN "ritmo_pr" numeric;
  ALTER TABLE "articulos_kb_blocks_blurb" ADD COLUMN "ritmo_mb_alterno" boolean;
  ALTER TABLE "articulos_kb_blocks_blurb" ADD COLUMN "ancho_pct" numeric DEFAULT 100;
  ALTER TABLE "articulos_kb_blocks_gallery" ADD COLUMN "ritmo_mt" numeric;
  ALTER TABLE "articulos_kb_blocks_gallery" ADD COLUMN "ritmo_mb" numeric;
  ALTER TABLE "articulos_kb_blocks_gallery" ADD COLUMN "ritmo_pt" numeric;
  ALTER TABLE "articulos_kb_blocks_gallery" ADD COLUMN "ritmo_pb" numeric;
  ALTER TABLE "articulos_kb_blocks_gallery" ADD COLUMN "ritmo_pr" numeric;
  ALTER TABLE "articulos_kb_blocks_gallery" ADD COLUMN "ritmo_mb_alterno" boolean;
  ALTER TABLE "articulos_kb_blocks_gallery" ADD COLUMN "ancho_pct" numeric DEFAULT 100;
  ALTER TABLE "articulos_kb_blocks_imagen" ADD CONSTRAINT "articulos_kb_blocks_imagen_src_id_media_id_fk" FOREIGN KEY ("src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articulos_kb_blocks_imagen" ADD CONSTRAINT "articulos_kb_blocks_imagen_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_kb_blocks_boton" ADD CONSTRAINT "articulos_kb_blocks_boton_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "articulos_kb_blocks_imagen_order_idx" ON "articulos_kb_blocks_imagen" USING btree ("_order");
  CREATE INDEX "articulos_kb_blocks_imagen_parent_id_idx" ON "articulos_kb_blocks_imagen" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_blocks_imagen_path_idx" ON "articulos_kb_blocks_imagen" USING btree ("_path");
  CREATE INDEX "articulos_kb_blocks_imagen_src_idx" ON "articulos_kb_blocks_imagen" USING btree ("src_id");
  CREATE INDEX "articulos_kb_blocks_boton_order_idx" ON "articulos_kb_blocks_boton" USING btree ("_order");
  CREATE INDEX "articulos_kb_blocks_boton_parent_id_idx" ON "articulos_kb_blocks_boton" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_blocks_boton_path_idx" ON "articulos_kb_blocks_boton" USING btree ("_path");`)
}
