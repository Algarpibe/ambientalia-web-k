/**
 * `etiquetas.descripcion` — el texto que el ARCHIVO del término pinta bajo su
 * `h1` y que la ficha del término no tenía.
 *
 * Campo por el test más simple: **varía entre instancias**, y el extractor lo
 * confirma en **12 de 12** (`medidas/extractor-listados.json`). Es RICO porque
 * el marcado se midió —`p`, `br`, `a`—, no porque conviniera.
 *
 * ⚠ El generador de Payload emite `import { MigrateUpArgs, … }` y este repo
 * compila con `verbatimModuleSyntax`, así que los tipos van en `import type` —
 * igual que las 16 migraciones anteriores. Es edición a mano de un fichero
 * generado, y por eso queda dicho aquí.
 */
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "etiquetas" ADD COLUMN "descripcion" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "etiquetas" DROP COLUMN "descripcion";`)
}
