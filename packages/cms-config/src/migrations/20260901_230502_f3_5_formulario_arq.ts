/**
 * 138.ª · ESCALÓN 1 — las 4 tablas y los 14 tipos de `formulario-arq`, el
 * bloque que entró en `bloques/arquetipos.ts` DESPUÉS de
 * `20260831_015813_f3_5_arquetipos` y por tanto sin tabla.
 *
 * El desfase se derivó, no se supuso: el esquema declara **12** bloques y la
 * DB tenía **11** —13 tablas `arquetipos*`, ninguna de formulario—, y el
 * complemento sale nombrado, no como cardinal (`derivaciones/paso0-138.json`).
 *
 * ── LA REVERSA, PROBADA MIENTRAS LA VENTANA ESTABA ABIERTA (§regla 30) ────
 * `arquetipos` a **0 filas**, así que correr el `down` no costaba dato. Con la
 * primera fila dentro, probarlo ya tiene precio. Medido en CUATRO ejes más el
 * registro de migraciones, **elemento a elemento y nunca por el total** —
 * `151 → 151` es exacto con dos tablas compensándose:
 *
 *   | eje | ANTES vs TRAS-DOWN |
 *   |---|---|
 *   | tablas (151) · columnas (1884) · tipos (340) · constraints (1101) | **0 y 0** |
 *   | `payload_migrations` (26) | **0 y 0** |
 *
 * Y el control positivo, porque un «idéntico» tiene dos causas que se escriben
 * igual —*la reversa funcionó* y *el instrumento no vio nada*—: TRAS-UP creó
 * **4/4 tablas y 14/14 tipos**. Congelada: `derivaciones/reversa-138.json`.
 *
 * ⚠ **Y el LOG dijo otra cosa que la TABLA**, que es §regla 30 en vivo:
 * `migrate:down` imprimió *«Rolling back batch 4 consisting of 27
 * migration(s)»* y `payload_migrations` dice que revirtió **UNA**. El
 * veredicto lo da la tabla.
 *
 * ── POR QUÉ LLEVA `IF EXISTS`, Y POR QUÉ **NO** ES UNA INSTANCIA DE §regla 42 ─
 * §regla 42 describe un patrón concreto: `DROP TABLE … CASCADE` y DESPUÉS el
 * `ALTER TABLE … DROP CONSTRAINT` que ese CASCADE ya se llevó ⇒ exit 1 y cero
 * revertido **a la primera**. **Este `down` no lo emite** —no crea colección
 * nueva, así que no toca `payload_locked_documents_rels`— y medido con el
 * `down` sin `IF EXISTS` sobre la DB real (en `BEGIN…ROLLBACK`, sin editar el
 * fuente): **0 separadoras en la primera pasada**. El cardinal de §regla 42
 * **sigue en 4**; inflarlo sería heredarlo del descubrimiento en vez de
 * derivarlo.
 *
 * Lo que el `IF EXISTS` sí compra es **IDEMPOTENCIA**, que es otra propiedad:
 * en la SEGUNDA pasada, sin él, falla con `42P01 table
 * "arquetipos_blocks_formulario_arq_campos_opciones" does not exist`; con él,
 * limpio. **1 separadora, y está en la segunda pasada, no en la primera.**
 * Derivación: `derivaciones/regla42-separadoras-138.json`.
 *
 * ⚠ `migrate:create` emite `import { MigrateUpArgs, MigrateDownArgs, sql }`, y
 * `verbatimModuleSyntax` obliga a separar el import de tipos. Se corrige a la
 * forma que ya usan las 26 anteriores.
 */
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_arquetipos_blocks_formulario_arq_campos_tipo" AS ENUM('texto', 'seleccion', 'casillas');
  CREATE TYPE "public"."enum_arquetipos_blocks_formulario_arq_ritmo_mb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_formulario_arq_ritmo_mb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_formulario_arq_ritmo_mb_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_formulario_arq_ritmo_pt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_formulario_arq_ritmo_pt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_formulario_arq_ritmo_pt_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_formulario_arq_ritmo_mt_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_formulario_arq_ritmo_mt_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_formulario_arq_ritmo_mt_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_formulario_arq_ritmo_pb_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_formulario_arq_ritmo_pb_movil_unidad" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_formulario_arq_ritmo_pb_unidad767" AS ENUM('px', 'pct');
  CREATE TYPE "public"."enum_arquetipos_blocks_formulario_arq_metodo" AS ENUM('POST', 'GET');
  CREATE TABLE "arquetipos_blocks_formulario_arq_campos_opciones" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"valor" varchar,
  	"texto" varchar NOT NULL
  );
  
  CREATE TABLE "arquetipos_blocks_formulario_arq_campos" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"tipo" "enum_arquetipos_blocks_formulario_arq_campos_tipo" NOT NULL,
  	"etiqueta" varchar,
  	"requerido" boolean
  );
  
  CREATE TABLE "arquetipos_blocks_formulario_arq_ocultos" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"valor" varchar
  );
  
  CREATE TABLE "arquetipos_blocks_formulario_arq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pieza" varchar,
  	"ritmo_mb_valor" numeric,
  	"ritmo_mb_unidad" "enum_arquetipos_blocks_formulario_arq_ritmo_mb_unidad",
  	"ritmo_mb_movil_valor" numeric,
  	"ritmo_mb_movil_unidad" "enum_arquetipos_blocks_formulario_arq_ritmo_mb_movil_unidad",
  	"ritmo_mb_valor767" numeric,
  	"ritmo_mb_unidad767" "enum_arquetipos_blocks_formulario_arq_ritmo_mb_unidad767",
  	"ritmo_pt_valor" numeric,
  	"ritmo_pt_unidad" "enum_arquetipos_blocks_formulario_arq_ritmo_pt_unidad",
  	"ritmo_pt_movil_valor" numeric,
  	"ritmo_pt_movil_unidad" "enum_arquetipos_blocks_formulario_arq_ritmo_pt_movil_unidad",
  	"ritmo_pt_valor767" numeric,
  	"ritmo_pt_unidad767" "enum_arquetipos_blocks_formulario_arq_ritmo_pt_unidad767",
  	"ritmo_mt_valor" numeric,
  	"ritmo_mt_unidad" "enum_arquetipos_blocks_formulario_arq_ritmo_mt_unidad",
  	"ritmo_mt_movil_valor" numeric,
  	"ritmo_mt_movil_unidad" "enum_arquetipos_blocks_formulario_arq_ritmo_mt_movil_unidad",
  	"ritmo_mt_valor767" numeric,
  	"ritmo_mt_unidad767" "enum_arquetipos_blocks_formulario_arq_ritmo_mt_unidad767",
  	"ritmo_pb_valor" numeric,
  	"ritmo_pb_unidad" "enum_arquetipos_blocks_formulario_arq_ritmo_pb_unidad",
  	"ritmo_pb_movil_valor" numeric,
  	"ritmo_pb_movil_unidad" "enum_arquetipos_blocks_formulario_arq_ritmo_pb_movil_unidad",
  	"ritmo_pb_valor767" numeric,
  	"ritmo_pb_unidad767" "enum_arquetipos_blocks_formulario_arq_ritmo_pb_unidad767",
  	"destino" varchar NOT NULL,
  	"metodo" "enum_arquetipos_blocks_formulario_arq_metodo" NOT NULL,
  	"texto_boton" varchar NOT NULL,
  	"block_name" varchar
  );
  
  ALTER TABLE "arquetipos_blocks_formulario_arq_campos_opciones" ADD CONSTRAINT "arquetipos_blocks_formulario_arq_campos_opciones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."arquetipos_blocks_formulario_arq_campos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "arquetipos_blocks_formulario_arq_campos" ADD CONSTRAINT "arquetipos_blocks_formulario_arq_campos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."arquetipos_blocks_formulario_arq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "arquetipos_blocks_formulario_arq_ocultos" ADD CONSTRAINT "arquetipos_blocks_formulario_arq_ocultos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."arquetipos_blocks_formulario_arq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "arquetipos_blocks_formulario_arq" ADD CONSTRAINT "arquetipos_blocks_formulario_arq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."arquetipos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "arquetipos_blocks_formulario_arq_campos_opciones_order_idx" ON "arquetipos_blocks_formulario_arq_campos_opciones" USING btree ("_order");
  CREATE INDEX "arquetipos_blocks_formulario_arq_campos_opciones_parent_id_idx" ON "arquetipos_blocks_formulario_arq_campos_opciones" USING btree ("_parent_id");
  CREATE INDEX "arquetipos_blocks_formulario_arq_campos_order_idx" ON "arquetipos_blocks_formulario_arq_campos" USING btree ("_order");
  CREATE INDEX "arquetipos_blocks_formulario_arq_campos_parent_id_idx" ON "arquetipos_blocks_formulario_arq_campos" USING btree ("_parent_id");
  CREATE INDEX "arquetipos_blocks_formulario_arq_ocultos_order_idx" ON "arquetipos_blocks_formulario_arq_ocultos" USING btree ("_order");
  CREATE INDEX "arquetipos_blocks_formulario_arq_ocultos_parent_id_idx" ON "arquetipos_blocks_formulario_arq_ocultos" USING btree ("_parent_id");
  CREATE INDEX "arquetipos_blocks_formulario_arq_order_idx" ON "arquetipos_blocks_formulario_arq" USING btree ("_order");
  CREATE INDEX "arquetipos_blocks_formulario_arq_parent_id_idx" ON "arquetipos_blocks_formulario_arq" USING btree ("_parent_id");
  CREATE INDEX "arquetipos_blocks_formulario_arq_path_idx" ON "arquetipos_blocks_formulario_arq" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE IF EXISTS "arquetipos_blocks_formulario_arq_campos_opciones" CASCADE;
  DROP TABLE IF EXISTS "arquetipos_blocks_formulario_arq_campos" CASCADE;
  DROP TABLE IF EXISTS "arquetipos_blocks_formulario_arq_ocultos" CASCADE;
  DROP TABLE IF EXISTS "arquetipos_blocks_formulario_arq" CASCADE;
  DROP TYPE IF EXISTS "public"."enum_arquetipos_blocks_formulario_arq_campos_tipo";
  DROP TYPE IF EXISTS "public"."enum_arquetipos_blocks_formulario_arq_ritmo_mb_unidad";
  DROP TYPE IF EXISTS "public"."enum_arquetipos_blocks_formulario_arq_ritmo_mb_movil_unidad";
  DROP TYPE IF EXISTS "public"."enum_arquetipos_blocks_formulario_arq_ritmo_mb_unidad767";
  DROP TYPE IF EXISTS "public"."enum_arquetipos_blocks_formulario_arq_ritmo_pt_unidad";
  DROP TYPE IF EXISTS "public"."enum_arquetipos_blocks_formulario_arq_ritmo_pt_movil_unidad";
  DROP TYPE IF EXISTS "public"."enum_arquetipos_blocks_formulario_arq_ritmo_pt_unidad767";
  DROP TYPE IF EXISTS "public"."enum_arquetipos_blocks_formulario_arq_ritmo_mt_unidad";
  DROP TYPE IF EXISTS "public"."enum_arquetipos_blocks_formulario_arq_ritmo_mt_movil_unidad";
  DROP TYPE IF EXISTS "public"."enum_arquetipos_blocks_formulario_arq_ritmo_mt_unidad767";
  DROP TYPE IF EXISTS "public"."enum_arquetipos_blocks_formulario_arq_ritmo_pb_unidad";
  DROP TYPE IF EXISTS "public"."enum_arquetipos_blocks_formulario_arq_ritmo_pb_movil_unidad";
  DROP TYPE IF EXISTS "public"."enum_arquetipos_blocks_formulario_arq_ritmo_pb_unidad767";
  DROP TYPE IF EXISTS "public"."enum_arquetipos_blocks_formulario_arq_metodo";`)
}
