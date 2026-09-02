/**
 * 139.ª · ESCALÓN 2 — CMS-8b, los DOS vacíos comprobados EN EL ORIGINAL (no
 * los tres en bloque): `texto-arq.contenido` (1 de 100) y
 * `formulario-arq…opciones.texto` (3, en 1 formulario) pasan por
 * `requeridoConVacio()` — la ausencia mata, la cadena vacía es dato legal.
 * `video-arq.url` NO se toca: 2 de 2 es un 100 % redondo y la comprobación
 * dio extractor, no dato (ficha en `docs/ESQUEMA-CMS.md` §CMS-8b).
 *
 * ── LA COMPROBACIÓN, ANTES de aplicar nada (el encargo lo exige por delante
 *    del esquema) ──────────────────────────────────────────────────────────
 * - `texto-arq.contenido`: `et_pb_text_24` de `monitor-calidad-aire` existe
 *   en el HTML servido —entre la galería y `et_pb_text_25.lista-resultados`—
 *   y no lleva `.et_pb_text_inner` dentro: separador vacío real.
 * - `formulario-arq…opciones.texto`: el `<select name="field[27]">` trae
 *   `<option selected></option>` (el placeholder «— elige —») **y** una
 *   segunda `<option value="">` sin texto en medio del listado de países
 *   (269 opciones, #1 y #242 vacías); `field[51]` trae la misma placeholder
 *   (#1 de 16). Los tres, servidos, verbatim.
 *
 * ── LA REVERSA, PROBADA HOY IGUAL QUE EL ESCALÓN 1 (§regla 30) ────────────
 * Elemento a elemento contra `reversa-139b-*-ANTES.txt`:
 *
 *   | eje | ANTES vs TRAS-DOWN |
 *   |---|---|
 *   | tablas (155) · columnas (1934) · tipos (354) · constraints (472) | **0 y 0** |
 *   | `payload_migrations` (28) | **0 y 0** |
 *
 * Control positivo: TRAS-UP `contenido`/`texto` pasan a `is_nullable = YES`.
 *
 * ⚠ **El LOG mintió una TERCERA vez** (§regla 30): *«Rolling back batch 6
 * consisting of 29 migration(s)»* y `payload_migrations` revirtió **UNA**.
 *
 * ── §regla 42 NO APLICA, otra vez estructuralmente: sólo dos `ALTER COLUMN`,
 *    cero `DROP TABLE`/`DROP CONSTRAINT`.
 *
 * `requeridoConVacio()` se tocó (`campos/comunes.ts`) para ENCADENAR con un
 * `validate` previo en vez de sustituirlo — `contenido` ya traía
 * `validaHtmlCorpus` (whitelist de etiquetas) y sobrescribirlo lo habría
 * perdido en silencio. El único consumidor previo (`grupo-a.ts:173`, sin
 * `validate` propio) no cambia de comportamiento: `validaPrevio` es
 * `undefined` ahí y la cadena colapsa al mismo `true` de siempre.
 */
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "arquetipos_blocks_texto_arq" ALTER COLUMN "contenido" DROP NOT NULL;
  ALTER TABLE "arquetipos_blocks_formulario_arq_campos_opciones" ALTER COLUMN "texto" DROP NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "arquetipos_blocks_texto_arq" ALTER COLUMN "contenido" SET NOT NULL;
  ALTER TABLE "arquetipos_blocks_formulario_arq_campos_opciones" ALTER COLUMN "texto" SET NOT NULL;`)
}
