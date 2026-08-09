// ⚠ `migrate:create` emite `import { MigrateUpArgs, MigrateDownArgs, sql }`, y
// este paquete compila con `verbatimModuleSyntax`: los dos primeros son TIPOS y
// hay que importarlos como tales. **Hay que rehacerlo en cada migración nueva**
// — la inicial lo documenta y ésta es la prueba de que sigue haciendo falta.
import type { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres"
import { sql } from "@payloadcms/db-postgres"

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "articulos_kb_blocks_titular" CASCADE;
  DROP TABLE "articulos_kb_blocks_claim" CASCADE;
  DROP TABLE "articulos_kb_blocks_p" CASCADE;
  DROP TABLE "articulos_kb_blocks_ul_ul" CASCADE;
  DROP TABLE "articulos_kb_blocks_ul" CASCADE;
  DROP TABLE "articulos_kb_blocks_claim_2" CASCADE;
  DROP TABLE "articulos_kb_blocks_titular_2" CASCADE;
  DROP TABLE "articulos_kb_blocks_texto" CASCADE;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "articulos_kb_blocks_titular" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar NOT NULL,
  	"nivel" numeric DEFAULT 3,
  	"ritmo_mt" numeric,
  	"ritmo_mb" numeric,
  	"ritmo_pt" numeric,
  	"ritmo_pb" numeric,
  	"ritmo_pr" numeric,
  	"ritmo_mb_alterno" boolean,
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "articulos_kb_blocks_claim" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar NOT NULL,
  	"nivel" numeric DEFAULT 2,
  	"ritmo_mt" numeric,
  	"ritmo_mb" numeric,
  	"ritmo_pt" numeric,
  	"ritmo_pb" numeric,
  	"ritmo_pr" numeric,
  	"ritmo_mb_alterno" boolean,
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  CREATE TABLE "articulos_kb_blocks_p" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"p" jsonb NOT NULL,
  	"pb" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "articulos_kb_blocks_ul_ul" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" jsonb NOT NULL
  );
  
  CREATE TABLE "articulos_kb_blocks_ul" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "articulos_kb_blocks_claim_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"claim" varchar,
  	"nivel" numeric DEFAULT 2,
  	"block_name" varchar
  );
  
  CREATE TABLE "articulos_kb_blocks_titular_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titular" varchar NOT NULL,
  	"nivel" numeric DEFAULT 3,
  	"block_name" varchar
  );
  
  CREATE TABLE "articulos_kb_blocks_texto" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"lh" numeric DEFAULT 30.6,
  	"ritmo_mt" numeric,
  	"ritmo_mb" numeric,
  	"ritmo_pt" numeric,
  	"ritmo_pb" numeric,
  	"ritmo_pr" numeric,
  	"ritmo_mb_alterno" boolean,
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  ALTER TABLE "articulos_kb_blocks_titular" ADD CONSTRAINT "articulos_kb_blocks_titular_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_kb_blocks_claim" ADD CONSTRAINT "articulos_kb_blocks_claim_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_kb_blocks_p" ADD CONSTRAINT "articulos_kb_blocks_p_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_kb_blocks_ul_ul" ADD CONSTRAINT "articulos_kb_blocks_ul_ul_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb_blocks_ul"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_kb_blocks_ul" ADD CONSTRAINT "articulos_kb_blocks_ul_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_kb_blocks_claim_2" ADD CONSTRAINT "articulos_kb_blocks_claim_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_kb_blocks_titular_2" ADD CONSTRAINT "articulos_kb_blocks_titular_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_kb_blocks_texto" ADD CONSTRAINT "articulos_kb_blocks_texto_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "articulos_kb_blocks_titular_order_idx" ON "articulos_kb_blocks_titular" USING btree ("_order");
  CREATE INDEX "articulos_kb_blocks_titular_parent_id_idx" ON "articulos_kb_blocks_titular" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_blocks_titular_path_idx" ON "articulos_kb_blocks_titular" USING btree ("_path");
  CREATE INDEX "articulos_kb_blocks_claim_order_idx" ON "articulos_kb_blocks_claim" USING btree ("_order");
  CREATE INDEX "articulos_kb_blocks_claim_parent_id_idx" ON "articulos_kb_blocks_claim" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_blocks_claim_path_idx" ON "articulos_kb_blocks_claim" USING btree ("_path");
  CREATE INDEX "articulos_kb_blocks_p_order_idx" ON "articulos_kb_blocks_p" USING btree ("_order");
  CREATE INDEX "articulos_kb_blocks_p_parent_id_idx" ON "articulos_kb_blocks_p" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_blocks_p_path_idx" ON "articulos_kb_blocks_p" USING btree ("_path");
  CREATE INDEX "articulos_kb_blocks_ul_ul_order_idx" ON "articulos_kb_blocks_ul_ul" USING btree ("_order");
  CREATE INDEX "articulos_kb_blocks_ul_ul_parent_id_idx" ON "articulos_kb_blocks_ul_ul" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_blocks_ul_order_idx" ON "articulos_kb_blocks_ul" USING btree ("_order");
  CREATE INDEX "articulos_kb_blocks_ul_parent_id_idx" ON "articulos_kb_blocks_ul" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_blocks_ul_path_idx" ON "articulos_kb_blocks_ul" USING btree ("_path");
  CREATE INDEX "articulos_kb_blocks_claim_2_order_idx" ON "articulos_kb_blocks_claim_2" USING btree ("_order");
  CREATE INDEX "articulos_kb_blocks_claim_2_parent_id_idx" ON "articulos_kb_blocks_claim_2" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_blocks_claim_2_path_idx" ON "articulos_kb_blocks_claim_2" USING btree ("_path");
  CREATE INDEX "articulos_kb_blocks_titular_2_order_idx" ON "articulos_kb_blocks_titular_2" USING btree ("_order");
  CREATE INDEX "articulos_kb_blocks_titular_2_parent_id_idx" ON "articulos_kb_blocks_titular_2" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_blocks_titular_2_path_idx" ON "articulos_kb_blocks_titular_2" USING btree ("_path");
  CREATE INDEX "articulos_kb_blocks_texto_order_idx" ON "articulos_kb_blocks_texto" USING btree ("_order");
  CREATE INDEX "articulos_kb_blocks_texto_parent_id_idx" ON "articulos_kb_blocks_texto" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_blocks_texto_path_idx" ON "articulos_kb_blocks_texto" USING btree ("_path");`)
}
