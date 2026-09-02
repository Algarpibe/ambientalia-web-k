/**
 * 139.ª · ESCALÓN 1 — CMS-8a = A: `imagen-arq.enlace` deja de exigir
 * `label`/`href` (dos `ALTER COLUMN … DROP NOT NULL`). El `required` que
 * llevaban no fue nunca una decisión medida: `enlace()` es un `group` de
 * Payload, y un `group` no es opcional por sí mismo — de ahí salió un modelo
 * que afirmaba «toda imagen lleva enlace» sin que nadie lo hubiera elegido.
 * La garantía que sí significaba algo la conserva un validador de coherencia
 * (si hay `href`, hay `label`) en `enlace()` — `campos/comunes.ts`. Los otros
 * dos consumidores de `enlace()` —`boton-arq.destino` y `cta-arq.destino`—
 * se derivaron con `grep` (3 usos totales) y NO se tocan: ahí el `required`
 * sí es la decisión (el módulo existe para enlazar).
 *
 * ── LA VENTANA Y LA REVERSA, PROBADA HOY (§regla 30) ──────────────────────
 * `arquetipos` seguía a **0 filas** al arrancar la tanda (re-derivado en
 * PASO 0, no heredado del encargo). Reversa probada ELEMENTO A ELEMENTO, no
 * por el total —`docs/research/cola-larga/derivaciones/reversa-139-*.txt`—:
 *
 *   | eje | ANTES vs TRAS-DOWN |
 *   |---|---|
 *   | tablas (155) · columnas (1934) · tipos (354) · constraints (472) | **0 y 0** |
 *   | `payload_migrations` (27) | **0 y 0** |
 *
 * Control positivo (§regla 30): TRAS-UP `enlace_label`/`enlace_href` pasan a
 * `is_nullable = YES`; repetido un segundo ciclo down→up con el mismo
 * resultado, sin error de idempotencia en ninguna dirección.
 *
 * ⚠ **El LOG volvió a decir otra cosa que la TABLA** (§regla 30, otra vez):
 * `migrate:down` imprimió *«Rolling back batch 5 consisting of 28
 * migration(s)»* dos veces seguidas y `payload_migrations` revirtió **UNA**
 * cada vez. El veredicto lo da la tabla, no el log.
 *
 * ── §regla 42 NO APLICA AQUÍ, Y NO POR SUERTE: EL PATRÓN ESTÁ ESTRUCTURALMENTE
 *    AUSENTE ────────────────────────────────────────────────────────────────
 * §regla 42 describe `DROP TABLE … CASCADE` seguido de un `DROP CONSTRAINT`
 * que ese CASCADE ya se llevó. Esta migración no crea tabla, no crea
 * colección con relación a `payload_locked_documents_rels`, y no tiene NINGÚN
 * `DROP TABLE` ni `DROP CONSTRAINT` — son sólo dos `ALTER COLUMN`. No hace
 * falta medir separadoras: el patrón no tiene dónde vivir. `IF EXISTS`
 * tampoco hace falta — `DROP NOT NULL`/`SET NOT NULL` son idempotentes por sí
 * mismos, verificado con un segundo ciclo sin error.
 */
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "arquetipos_blocks_imagen_arq" ALTER COLUMN "enlace_label" DROP NOT NULL;
  ALTER TABLE "arquetipos_blocks_imagen_arq" ALTER COLUMN "enlace_href" DROP NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "arquetipos_blocks_imagen_arq" ALTER COLUMN "enlace_label" SET NOT NULL;
  ALTER TABLE "arquetipos_blocks_imagen_arq" ALTER COLUMN "enlace_href" SET NOT NULL;`)
}
