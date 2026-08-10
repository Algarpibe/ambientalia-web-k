/**
 * F3-1 · LA PIEL DEL TITULAR — el campo que cerró el escalón de la tipografía.
 *
 * ⚠ **`import type` y no `import`**: `migrate:create` emite `MigrateUpArgs` /
 * `MigrateDownArgs` como import de VALOR y este paquete compila con
 * `verbatimModuleSyntax`. Hay que rehacerlo en **cada** migración nueva; lo caza
 * el typecheck de `npm run check`, así que el olvido sale rojo.
 *
 * ── Por qué esta migración es la prueba de que el ensanchamiento es seguro ──
 * `titularesModulo` se añade a **`MODULO_TEXTO` (compartido)** y a
 * `MODULO_TEXTO_KB`, y el compartido lo consumen `monograficos` y `productos`,
 * que **ya están poblados** (2 y 9 documentos). El diff lo contesta solo:
 *
 *   > **3 `CREATE TABLE` + 6 `CREATE TYPE`, y CERO `ALTER` sobre una columna
 *   > existente.** Ni un dato se toca, ni una columna cambia de tipo, ni hay
 *   > `NOT NULL` que rellenar.
 *
 * Eso es lo que significa *retrocompatible*, y por eso el tabú de «no toques lo
 * poblado» no aplica (§2d.3 ya lo había dicho; aquí está el diff que lo prueba).
 * Los documentos existentes quedan sin filas de `titulares`, o sea **con el
 * defecto del tema**, que es exactamente lo que hoy renderizan.
 */
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_monograficos_blocks_texto_titulares_nivel" AS ENUM('h1', 'h2', 'h3', 'h4', 'h5', 'h6');
  CREATE TYPE "public"."enum_monograficos_blocks_texto_titulares_align" AS ENUM('left', 'center', 'right', 'justify');
  CREATE TYPE "public"."enum_productos_blocks_texto_titulares_nivel" AS ENUM('h1', 'h2', 'h3', 'h4', 'h5', 'h6');
  CREATE TYPE "public"."enum_productos_blocks_texto_titulares_align" AS ENUM('left', 'center', 'right', 'justify');
  CREATE TYPE "public"."enum_articulos_kb_blocks_texto_kb_titulares_nivel" AS ENUM('h1', 'h2', 'h3', 'h4', 'h5', 'h6');
  CREATE TYPE "public"."enum_articulos_kb_blocks_texto_kb_titulares_align" AS ENUM('left', 'center', 'right', 'justify');
  CREATE TABLE "monograficos_blocks_texto_titulares" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nivel" "enum_monograficos_blocks_texto_titulares_nivel" NOT NULL,
  	"fs" numeric,
  	"lh" numeric,
  	"fw" numeric,
  	"color" varchar,
  	"align" "enum_monograficos_blocks_texto_titulares_align",
  	"movil_fs" numeric
  );
  
  CREATE TABLE "productos_blocks_texto_titulares" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nivel" "enum_productos_blocks_texto_titulares_nivel" NOT NULL,
  	"fs" numeric,
  	"lh" numeric,
  	"fw" numeric,
  	"color" varchar,
  	"align" "enum_productos_blocks_texto_titulares_align",
  	"movil_fs" numeric
  );
  
  CREATE TABLE "articulos_kb_blocks_texto_kb_titulares" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nivel" "enum_articulos_kb_blocks_texto_kb_titulares_nivel" NOT NULL,
  	"fs" numeric,
  	"lh" numeric,
  	"fw" numeric,
  	"color" varchar,
  	"align" "enum_articulos_kb_blocks_texto_kb_titulares_align",
  	"movil_fs" numeric
  );
  
  ALTER TABLE "monograficos_blocks_texto_titulares" ADD CONSTRAINT "monograficos_blocks_texto_titulares_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."monograficos_blocks_texto"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "productos_blocks_texto_titulares" ADD CONSTRAINT "productos_blocks_texto_titulares_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."productos_blocks_texto"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_kb_blocks_texto_kb_titulares" ADD CONSTRAINT "articulos_kb_blocks_texto_kb_titulares_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos_kb_blocks_texto_kb"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "monograficos_blocks_texto_titulares_order_idx" ON "monograficos_blocks_texto_titulares" USING btree ("_order");
  CREATE INDEX "monograficos_blocks_texto_titulares_parent_id_idx" ON "monograficos_blocks_texto_titulares" USING btree ("_parent_id");
  CREATE INDEX "productos_blocks_texto_titulares_order_idx" ON "productos_blocks_texto_titulares" USING btree ("_order");
  CREATE INDEX "productos_blocks_texto_titulares_parent_id_idx" ON "productos_blocks_texto_titulares" USING btree ("_parent_id");
  CREATE INDEX "articulos_kb_blocks_texto_kb_titulares_order_idx" ON "articulos_kb_blocks_texto_kb_titulares" USING btree ("_order");
  CREATE INDEX "articulos_kb_blocks_texto_kb_titulares_parent_id_idx" ON "articulos_kb_blocks_texto_kb_titulares" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "monograficos_blocks_texto_titulares" CASCADE;
  DROP TABLE "productos_blocks_texto_titulares" CASCADE;
  DROP TABLE "articulos_kb_blocks_texto_kb_titulares" CASCADE;
  DROP TYPE "public"."enum_monograficos_blocks_texto_titulares_nivel";
  DROP TYPE "public"."enum_monograficos_blocks_texto_titulares_align";
  DROP TYPE "public"."enum_productos_blocks_texto_titulares_nivel";
  DROP TYPE "public"."enum_productos_blocks_texto_titulares_align";
  DROP TYPE "public"."enum_articulos_kb_blocks_texto_kb_titulares_nivel";
  DROP TYPE "public"."enum_articulos_kb_blocks_texto_kb_titulares_align";`)
}
