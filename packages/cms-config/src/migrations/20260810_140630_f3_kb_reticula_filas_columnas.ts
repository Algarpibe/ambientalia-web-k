// ⚠ `migrate:create` emite `import { MigrateUpArgs, MigrateDownArgs, sql }`, y
// este paquete compila con `verbatimModuleSyntax`: los dos primeros son TIPOS y
// hay que importarlos como tales. **Hay que rehacerlo en cada migración nueva.**
import type { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres"
import { sql } from "@payloadcms/db-postgres"

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_articulos_kb_blocks_texto_kb_ritmo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_texto_kb_ritmo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_texto_kb_ritmo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_texto_kb_ritmo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_texto_kb_ritmo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_texto_kb_ritmo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_imagen_kb_ritmo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_imagen_kb_ritmo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_imagen_kb_ritmo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_imagen_kb_ritmo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_imagen_kb_ritmo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_imagen_kb_ritmo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_boton_kb_ritmo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_boton_kb_ritmo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_boton_kb_ritmo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_boton_kb_ritmo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_boton_kb_ritmo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_boton_kb_ritmo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_blurb_ritmo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_blurb_ritmo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_blurb_ritmo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_blurb_ritmo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_blurb_ritmo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_blurb_ritmo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_gallery_ritmo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_gallery_ritmo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_gallery_ritmo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_gallery_ritmo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_gallery_ritmo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_blocks_gallery_ritmo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_cuerpo_columnas_ancho" AS ENUM('1_4', '1_3', '2_5', '1_2', '3_5', '2_3', '3_4', '4_4');
  CREATE TYPE "public"."enum_articulos_kb_cuerpo_pt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_cuerpo_pt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_cuerpo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_cuerpo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_cuerpo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_cuerpo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_cuerpo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_articulos_kb_cuerpo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TABLE "articulos_kb_blocks_imagen_kb" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src_id" integer NOT NULL,
  	"alt" varchar,
  	"ritmo_mt_valor" numeric,
  	"ritmo_mt_unidad" "enum_articulos_kb_blocks_imagen_kb_ritmo_mt_unidad",
  	"ritmo_mt_movil_valor" numeric,
  	"ritmo_mt_movil_unidad" "enum_articulos_kb_blocks_imagen_kb_ritmo_mt_movil_unidad",
  	"ritmo_mb_valor" numeric,
  	"ritmo_mb_unidad" "enum_articulos_kb_blocks_imagen_kb_ritmo_mb_unidad",
  	"ritmo_mb_movil_valor" numeric,
  	"ritmo_mb_movil_unidad" "enum_articulos_kb_blocks_imagen_kb_ritmo_mb_movil_unidad",
  	"ritmo_pb_valor" numeric,
  	"ritmo_pb_unidad" "enum_articulos_kb_blocks_imagen_kb_ritmo_pb_unidad",
  	"ritmo_pb_movil_valor" numeric,
  	"ritmo_pb_movil_unidad" "enum_articulos_kb_blocks_imagen_kb_ritmo_pb_movil_unidad",
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "articulos_kb_blocks_boton_kb" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL,
  	"external" boolean,
  	"ritmo_mt_valor" numeric,
  	"ritmo_mt_unidad" "enum_articulos_kb_blocks_boton_kb_ritmo_mt_unidad",
  	"ritmo_mt_movil_valor" numeric,
  	"ritmo_mt_movil_unidad" "enum_articulos_kb_blocks_boton_kb_ritmo_mt_movil_unidad",
  	"ritmo_mb_valor" numeric,
  	"ritmo_mb_unidad" "enum_articulos_kb_blocks_boton_kb_ritmo_mb_unidad",
  	"ritmo_mb_movil_valor" numeric,
  	"ritmo_mb_movil_unidad" "enum_articulos_kb_blocks_boton_kb_ritmo_mb_movil_unidad",
  	"ritmo_pb_valor" numeric,
  	"ritmo_pb_unidad" "enum_articulos_kb_blocks_boton_kb_ritmo_pb_unidad",
  	"ritmo_pb_movil_valor" numeric,
  	"ritmo_pb_movil_unidad" "enum_articulos_kb_blocks_boton_kb_ritmo_pb_movil_unidad",
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "articulos_kb_cuerpo_columnas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"ancho" "enum_articulos_kb_cuerpo_columnas_ancho" NOT NULL
  );
  
  CREATE TABLE "articulos_kb_cuerpo" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pt_valor" numeric,
  	"pt_unidad" "enum_articulos_kb_cuerpo_pt_unidad",
  	"pt_movil_valor" numeric,
  	"pt_movil_unidad" "enum_articulos_kb_cuerpo_pt_movil_unidad",
  	"pb_valor" numeric,
  	"pb_unidad" "enum_articulos_kb_cuerpo_pb_unidad",
  	"pb_movil_valor" numeric,
  	"pb_movil_unidad" "enum_articulos_kb_cuerpo_pb_movil_unidad",
  	"mt_valor" numeric,
  	"mt_unidad" "enum_articulos_kb_cuerpo_mt_unidad",
  	"mt_movil_valor" numeric,
  	"mt_movil_unidad" "enum_articulos_kb_cuerpo_mt_movil_unidad",
  	"mb_valor" numeric,
  	"mb_unidad" "enum_articulos_kb_cuerpo_mb_unidad",
  	"mb_movil_valor" numeric,
  	"mb_movil_unidad" "enum_articulos_kb_cuerpo_mb_movil_unidad"
  );
  
  ALTER TABLE "articulos_kb_blocks_texto_kb" ADD COLUMN "ritmo_mt_valor" numeric;
  ALTER TABLE "articulos_kb_blocks_texto_kb" ADD COLUMN "ritmo_mt_unidad" "enum_articulos_kb_blocks_texto_kb_ritmo_mt_unidad";
  ALTER TABLE "articulos_kb_blocks_texto_kb" ADD COLUMN "ritmo_mt_movil_valor" numeric;
  ALTER TABLE "articulos_kb_blocks_texto_kb" ADD COLUMN "ritmo_mt_movil_unidad" "enum_articulos_kb_blocks_texto_kb_ritmo_mt_movil_unidad";
  ALTER TABLE "articulos_kb_blocks_texto_kb" ADD COLUMN "ritmo_mb_valor" numeric;
  ALTER TABLE "articulos_kb_blocks_texto_kb" ADD COLUMN "ritmo_mb_unidad" "enum_articulos_kb_blocks_texto_kb_ritmo_mb_unidad";
  ALTER TABLE "articulos_kb_blocks_texto_kb" ADD COLUMN "ritmo_mb_movil_valor" numeric;
  ALTER TABLE "articulos_kb_blocks_texto_kb" ADD COLUMN "ritmo_mb_movil_unidad" "enum_articulos_kb_blocks_texto_kb_ritmo_mb_movil_unidad";
  ALTER TABLE "articulos_kb_blocks_texto_kb" ADD COLUMN "ritmo_pb_valor" numeric;
  ALTER TABLE "articulos_kb_blocks_texto_kb" ADD COLUMN "ritmo_pb_unidad" "enum_articulos_kb_blocks_texto_kb_ritmo_pb_unidad";
  ALTER TABLE "articulos_kb_blocks_texto_kb" ADD COLUMN "ritmo_pb_movil_valor" numeric;
  ALTER TABLE "articulos_kb_blocks_texto_kb" ADD COLUMN "ritmo_pb_movil_unidad" "enum_articulos_kb_blocks_texto_kb_ritmo_pb_movil_unidad";
  ALTER TABLE "articulos_kb_blocks_texto_kb" ADD COLUMN "ancho_pct" numeric DEFAULT 100;
  ALTER TABLE "articulos_kb_blocks_blurb" ADD COLUMN "ritmo_mt_valor" numeric;
  ALTER TABLE "articulos_kb_blocks_blurb" ADD COLUMN "ritmo_mt_unidad" "enum_articulos_kb_blocks_blurb_ritmo_mt_unidad";
  ALTER TABLE "articulos_kb_blocks_blurb" ADD COLUMN "ritmo_mt_movil_valor" numeric;
  ALTER TABLE "articulos_kb_blocks_blurb" ADD COLUMN "ritmo_mt_movil_unidad" "enum_articulos_kb_blocks_blurb_ritmo_mt_movil_unidad";
  ALTER TABLE "articulos_kb_blocks_blurb" ADD COLUMN "ritmo_mb_valor" numeric;
  ALTER TABLE "articulos_kb_blocks_blurb" ADD COLUMN "ritmo_mb_unidad" "enum_articulos_kb_blocks_blurb_ritmo_mb_unidad";
  ALTER TABLE "articulos_kb_blocks_blurb" ADD COLUMN "ritmo_mb_movil_valor" numeric;
  ALTER TABLE "articulos_kb_blocks_blurb" ADD COLUMN "ritmo_mb_movil_unidad" "enum_articulos_kb_blocks_blurb_ritmo_mb_movil_unidad";
  ALTER TABLE "articulos_kb_blocks_blurb" ADD COLUMN "ritmo_pb_valor" numeric;
  ALTER TABLE "articulos_kb_blocks_blurb" ADD COLUMN "ritmo_pb_unidad" "enum_articulos_kb_blocks_blurb_ritmo_pb_unidad";
  ALTER TABLE "articulos_kb_blocks_blurb" ADD COLUMN "ritmo_pb_movil_valor" numeric;
  ALTER TABLE "articulos_kb_blocks_blurb" ADD COLUMN "ritmo_pb_movil_unidad" "enum_articulos_kb_blocks_blurb_ritmo_pb_movil_unidad";
  ALTER TABLE "articulos_kb_blocks_blurb" ADD COLUMN "ancho_pct" numeric DEFAULT 100;
  ALTER TABLE "articulos_kb_blocks_gallery" ADD COLUMN "ritmo_mt_valor" numeric;
  ALTER TABLE "articulos_kb_blocks_gallery" ADD COLUMN "ritmo_mt_unidad" "enum_articulos_kb_blocks_gallery_ritmo_mt_unidad";
  ALTER TABLE "articulos_kb_blocks_gallery" ADD COLUMN "ritmo_mt_movil_valor" numeric;
  ALTER TABLE "articulos_kb_blocks_gallery" ADD COLUMN "ritmo_mt_movil_unidad" "enum_articulos_kb_blocks_gallery_ritmo_mt_movil_unidad";
  ALTER TABLE "articulos_kb_blocks_gallery" ADD COLUMN "ritmo_mb_valor" numeric;
  ALTER TABLE "articulos_kb_blocks_gallery" ADD COLUMN "ritmo_mb_unidad" "enum_articulos_kb_blocks_gallery_ritmo_mb_unidad";
  ALTER TABLE "articulos_kb_blocks_gallery" ADD COLUMN "ritmo_mb_movil_valor" numeric;
  ALTER TABLE "articulos_kb_blocks_gallery" ADD COLUMN "ritmo_mb_movil_unidad" "enum_articulos_kb_blocks_gallery_ritmo_mb_movil_unidad";
  ALTER TABLE "articulos_kb_blocks_gallery" ADD COLUMN "ritmo_pb_valor" numeric;
  ALTER TABLE "articulos_kb_blocks_gallery" ADD COLUMN "ritmo_pb_unidad" "enum_articulos_kb_blocks_gallery_ritmo_pb_unidad";
  ALTER TABLE "articulos_kb_blocks_gallery" ADD COLUMN "ritmo_pb_movil_valor" numeric;
  ALTER TABLE "articulos_kb_blocks_gallery" ADD COLUMN "ritmo_pb_movil_unidad" "enum_articulos_kb_blocks_gallery_ritmo_pb_movil_unidad";
  ALTER TABLE "articulos_kb_blocks_gallery" ADD COLUMN "ancho_pct" numeric DEFAULT 100;
  ALTER TABLE "articulos_kb_blocks_imagen_kb" ADD CONSTRAINT "articulos_kb_blocks_imagen_kb_src_id_media_id_fk" FOREIGN KEY ("src_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articulos_kb_blocks_imagen_kb" ADD CONSTRAINT "articulos_kb_blocks_imagen_kb_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_kb_blocks_boton_kb" ADD CONSTRAINT "articulos_kb_blocks_boton_kb_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_kb_cuerpo_columnas" ADD CONSTRAINT "articulos_kb_cuerpo_columnas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb_cuerpo"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_kb_cuerpo" ADD CONSTRAINT "articulos_kb_cuerpo_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "articulos_kb_blocks_imagen_kb_order_idx" ON "articulos_kb_blocks_imagen_kb" USING btree ("_order");
  CREATE INDEX "articulos_kb_blocks_imagen_kb_parent_id_idx" ON "articulos_kb_blocks_imagen_kb" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_blocks_imagen_kb_path_idx" ON "articulos_kb_blocks_imagen_kb" USING btree ("_path");
  CREATE INDEX "articulos_kb_blocks_imagen_kb_src_idx" ON "articulos_kb_blocks_imagen_kb" USING btree ("src_id");
  CREATE INDEX "articulos_kb_blocks_boton_kb_order_idx" ON "articulos_kb_blocks_boton_kb" USING btree ("_order");
  CREATE INDEX "articulos_kb_blocks_boton_kb_parent_id_idx" ON "articulos_kb_blocks_boton_kb" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_blocks_boton_kb_path_idx" ON "articulos_kb_blocks_boton_kb" USING btree ("_path");
  CREATE INDEX "articulos_kb_cuerpo_columnas_order_idx" ON "articulos_kb_cuerpo_columnas" USING btree ("_order");
  CREATE INDEX "articulos_kb_cuerpo_columnas_parent_id_idx" ON "articulos_kb_cuerpo_columnas" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_cuerpo_order_idx" ON "articulos_kb_cuerpo" USING btree ("_order");
  CREATE INDEX "articulos_kb_cuerpo_parent_id_idx" ON "articulos_kb_cuerpo" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "articulos_kb_blocks_imagen_kb" CASCADE;
  DROP TABLE "articulos_kb_blocks_boton_kb" CASCADE;
  DROP TABLE "articulos_kb_cuerpo_columnas" CASCADE;
  DROP TABLE "articulos_kb_cuerpo" CASCADE;
  ALTER TABLE "articulos_kb_blocks_texto_kb" DROP COLUMN "ritmo_mt_valor";
  ALTER TABLE "articulos_kb_blocks_texto_kb" DROP COLUMN "ritmo_mt_unidad";
  ALTER TABLE "articulos_kb_blocks_texto_kb" DROP COLUMN "ritmo_mt_movil_valor";
  ALTER TABLE "articulos_kb_blocks_texto_kb" DROP COLUMN "ritmo_mt_movil_unidad";
  ALTER TABLE "articulos_kb_blocks_texto_kb" DROP COLUMN "ritmo_mb_valor";
  ALTER TABLE "articulos_kb_blocks_texto_kb" DROP COLUMN "ritmo_mb_unidad";
  ALTER TABLE "articulos_kb_blocks_texto_kb" DROP COLUMN "ritmo_mb_movil_valor";
  ALTER TABLE "articulos_kb_blocks_texto_kb" DROP COLUMN "ritmo_mb_movil_unidad";
  ALTER TABLE "articulos_kb_blocks_texto_kb" DROP COLUMN "ritmo_pb_valor";
  ALTER TABLE "articulos_kb_blocks_texto_kb" DROP COLUMN "ritmo_pb_unidad";
  ALTER TABLE "articulos_kb_blocks_texto_kb" DROP COLUMN "ritmo_pb_movil_valor";
  ALTER TABLE "articulos_kb_blocks_texto_kb" DROP COLUMN "ritmo_pb_movil_unidad";
  ALTER TABLE "articulos_kb_blocks_texto_kb" DROP COLUMN "ancho_pct";
  ALTER TABLE "articulos_kb_blocks_blurb" DROP COLUMN "ritmo_mt_valor";
  ALTER TABLE "articulos_kb_blocks_blurb" DROP COLUMN "ritmo_mt_unidad";
  ALTER TABLE "articulos_kb_blocks_blurb" DROP COLUMN "ritmo_mt_movil_valor";
  ALTER TABLE "articulos_kb_blocks_blurb" DROP COLUMN "ritmo_mt_movil_unidad";
  ALTER TABLE "articulos_kb_blocks_blurb" DROP COLUMN "ritmo_mb_valor";
  ALTER TABLE "articulos_kb_blocks_blurb" DROP COLUMN "ritmo_mb_unidad";
  ALTER TABLE "articulos_kb_blocks_blurb" DROP COLUMN "ritmo_mb_movil_valor";
  ALTER TABLE "articulos_kb_blocks_blurb" DROP COLUMN "ritmo_mb_movil_unidad";
  ALTER TABLE "articulos_kb_blocks_blurb" DROP COLUMN "ritmo_pb_valor";
  ALTER TABLE "articulos_kb_blocks_blurb" DROP COLUMN "ritmo_pb_unidad";
  ALTER TABLE "articulos_kb_blocks_blurb" DROP COLUMN "ritmo_pb_movil_valor";
  ALTER TABLE "articulos_kb_blocks_blurb" DROP COLUMN "ritmo_pb_movil_unidad";
  ALTER TABLE "articulos_kb_blocks_blurb" DROP COLUMN "ancho_pct";
  ALTER TABLE "articulos_kb_blocks_gallery" DROP COLUMN "ritmo_mt_valor";
  ALTER TABLE "articulos_kb_blocks_gallery" DROP COLUMN "ritmo_mt_unidad";
  ALTER TABLE "articulos_kb_blocks_gallery" DROP COLUMN "ritmo_mt_movil_valor";
  ALTER TABLE "articulos_kb_blocks_gallery" DROP COLUMN "ritmo_mt_movil_unidad";
  ALTER TABLE "articulos_kb_blocks_gallery" DROP COLUMN "ritmo_mb_valor";
  ALTER TABLE "articulos_kb_blocks_gallery" DROP COLUMN "ritmo_mb_unidad";
  ALTER TABLE "articulos_kb_blocks_gallery" DROP COLUMN "ritmo_mb_movil_valor";
  ALTER TABLE "articulos_kb_blocks_gallery" DROP COLUMN "ritmo_mb_movil_unidad";
  ALTER TABLE "articulos_kb_blocks_gallery" DROP COLUMN "ritmo_pb_valor";
  ALTER TABLE "articulos_kb_blocks_gallery" DROP COLUMN "ritmo_pb_unidad";
  ALTER TABLE "articulos_kb_blocks_gallery" DROP COLUMN "ritmo_pb_movil_valor";
  ALTER TABLE "articulos_kb_blocks_gallery" DROP COLUMN "ritmo_pb_movil_unidad";
  ALTER TABLE "articulos_kb_blocks_gallery" DROP COLUMN "ancho_pct";
  DROP TYPE "public"."enum_articulos_kb_blocks_texto_kb_ritmo_mt_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_texto_kb_ritmo_mt_movil_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_texto_kb_ritmo_mb_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_texto_kb_ritmo_mb_movil_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_texto_kb_ritmo_pb_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_texto_kb_ritmo_pb_movil_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_imagen_kb_ritmo_mt_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_imagen_kb_ritmo_mt_movil_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_imagen_kb_ritmo_mb_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_imagen_kb_ritmo_mb_movil_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_imagen_kb_ritmo_pb_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_imagen_kb_ritmo_pb_movil_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_boton_kb_ritmo_mt_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_boton_kb_ritmo_mt_movil_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_boton_kb_ritmo_mb_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_boton_kb_ritmo_mb_movil_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_boton_kb_ritmo_pb_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_boton_kb_ritmo_pb_movil_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_blurb_ritmo_mt_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_blurb_ritmo_mt_movil_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_blurb_ritmo_mb_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_blurb_ritmo_mb_movil_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_blurb_ritmo_pb_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_blurb_ritmo_pb_movil_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_gallery_ritmo_mt_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_gallery_ritmo_mt_movil_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_gallery_ritmo_mb_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_gallery_ritmo_mb_movil_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_gallery_ritmo_pb_unidad";
  DROP TYPE "public"."enum_articulos_kb_blocks_gallery_ritmo_pb_movil_unidad";
  DROP TYPE "public"."enum_articulos_kb_cuerpo_columnas_ancho";
  DROP TYPE "public"."enum_articulos_kb_cuerpo_pt_unidad";
  DROP TYPE "public"."enum_articulos_kb_cuerpo_pt_movil_unidad";
  DROP TYPE "public"."enum_articulos_kb_cuerpo_pb_unidad";
  DROP TYPE "public"."enum_articulos_kb_cuerpo_pb_movil_unidad";
  DROP TYPE "public"."enum_articulos_kb_cuerpo_mt_unidad";
  DROP TYPE "public"."enum_articulos_kb_cuerpo_mt_movil_unidad";
  DROP TYPE "public"."enum_articulos_kb_cuerpo_mb_unidad";
  DROP TYPE "public"."enum_articulos_kb_cuerpo_mb_movil_unidad";`)
}
