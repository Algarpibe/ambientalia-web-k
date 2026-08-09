// ⚠ `migrate:create` emite `import { MigrateUpArgs, MigrateDownArgs, sql }`, y
// este paquete compila con `verbatimModuleSyntax`: los dos primeros son TIPOS y
// hay que importarlos como tales. **Hay que rehacerlo en cada migración nueva**
// — la inicial lo documenta y ésta es la prueba de que sigue haciendo falta.
import type { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres"
import { sql } from "@payloadcms/db-postgres"

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "articulos_kb_blocks_texto_kb" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"html" varchar NOT NULL,
  	"ritmo_mt" numeric,
  	"ritmo_mb" numeric,
  	"ritmo_pt" numeric,
  	"ritmo_pb" numeric,
  	"ritmo_pr" numeric,
  	"ritmo_mb_alterno" boolean,
  	"ancho_pct" numeric DEFAULT 100,
  	"block_name" varchar
  );
  
  ALTER TABLE "articulos_kb_blocks_blurb" ALTER COLUMN "descripcion" SET DATA TYPE varchar;
  ALTER TABLE "articulos_kb_blocks_texto_kb" ADD CONSTRAINT "articulos_kb_blocks_texto_kb_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "articulos_kb_blocks_texto_kb_order_idx" ON "articulos_kb_blocks_texto_kb" USING btree ("_order");
  CREATE INDEX "articulos_kb_blocks_texto_kb_parent_id_idx" ON "articulos_kb_blocks_texto_kb" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_blocks_texto_kb_path_idx" ON "articulos_kb_blocks_texto_kb" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articulos_kb_blocks_texto_kb" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "articulos_kb_blocks_texto_kb" CASCADE;
  ALTER TABLE "articulos_kb_blocks_blurb" ALTER COLUMN "descripcion" SET DATA TYPE jsonb;`)
}
