import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "paginas_blocks_tabla_cabeceras" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar NOT NULL
  );
  
  CREATE TABLE "paginas_blocks_tabla_filas_celdas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar,
  	"fuerte" varchar,
  	"resto" varchar
  );
  
  CREATE TABLE "paginas_blocks_tabla_filas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "paginas_blocks_tabla" (
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
  
  ALTER TABLE "paginas_blocks_tabla_cabeceras" ADD CONSTRAINT "paginas_blocks_tabla_cabeceras_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas_blocks_tabla"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_tabla_filas_celdas" ADD CONSTRAINT "paginas_blocks_tabla_filas_celdas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas_blocks_tabla_filas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_tabla_filas" ADD CONSTRAINT "paginas_blocks_tabla_filas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas_blocks_tabla"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_tabla" ADD CONSTRAINT "paginas_blocks_tabla_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "paginas_blocks_tabla_cabeceras_order_idx" ON "paginas_blocks_tabla_cabeceras" USING btree ("_order");
  CREATE INDEX "paginas_blocks_tabla_cabeceras_parent_id_idx" ON "paginas_blocks_tabla_cabeceras" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_tabla_filas_celdas_order_idx" ON "paginas_blocks_tabla_filas_celdas" USING btree ("_order");
  CREATE INDEX "paginas_blocks_tabla_filas_celdas_parent_id_idx" ON "paginas_blocks_tabla_filas_celdas" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_tabla_filas_order_idx" ON "paginas_blocks_tabla_filas" USING btree ("_order");
  CREATE INDEX "paginas_blocks_tabla_filas_parent_id_idx" ON "paginas_blocks_tabla_filas" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_tabla_order_idx" ON "paginas_blocks_tabla" USING btree ("_order");
  CREATE INDEX "paginas_blocks_tabla_parent_id_idx" ON "paginas_blocks_tabla" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_tabla_path_idx" ON "paginas_blocks_tabla" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "paginas_blocks_tabla_cabeceras" CASCADE;
  DROP TABLE "paginas_blocks_tabla_filas_celdas" CASCADE;
  DROP TABLE "paginas_blocks_tabla_filas" CASCADE;
  DROP TABLE "paginas_blocks_tabla" CASCADE;`)
}
