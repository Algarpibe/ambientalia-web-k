/**
 * CMS-PR3 · **el documento del CPT SIN PÁGINA PROPIA** — `pagina` +
 * `hrefServido`, y `seo.title` condicionado.
 *
 * ── Lo que la generada traía y NO podía quedarse así ──────────────────────
 * `payload migrate:create` emitió `ADD COLUMN "pagina" … NOT NULL` **sin
 * defecto**, y `productos` **ya tiene filas**: Postgres rechaza eso en una tabla
 * no vacía. Se parte en tres pasos —añadir, rellenar, exigir— para que el
 * relleno sea **explícito y con su razón**, en vez de un `DEFAULT 'propia'` que
 * se llevaría por delante justo la distinción que esta migración introduce.
 *
 * ── El relleno, y por qué NO es «una ausencia traducida a valor benigno» ──
 * Las filas que ya están son las **9** que `src/lib/products.ts` sembró, y
 * `qa:productos-hueco` midió que **las 9 son URLs del CPT**, o sea que las 9
 * tienen página. `'propia'` no es un defecto cómodo: es el valor **medido** para
 * exactamente esas filas.
 *
 * ⚠ **Y por eso la migración lo COMPRUEBA antes de rellenar.** Si la tabla no
 * trae las 9 que la medida cubre, la premisa no se sostiene y **tira**: rellenar
 * a ciegas una tabla que alguien ya pobló de otra forma marcaría como «con
 * página» documentos que no la tienen, que es el defecto que esto viene a
 * cerrar. Un relleno sin guarda es la §regla 6 escrita en SQL.
 *
 * ── El NO-OP que esta migración tiene que cumplir ────────────────────────
 * Las 9 salen todas `propia`, `hrefServido` vacío y su `seo.title` intacto ⇒
 * **ni el round-trip ni el píxel se mueven**. Si alguna se moviera, el
 * condicional está mal escrito y no es la migración lo que hay que ajustar.
 *
 * ── ⚠ LA DERIVA AJENA QUE VENÍA DENTRO, nombrada y no colada ─────────────
 * La generada incluía además `terminos_kunakpedia.titulo DROP NOT NULL`. **No
 * es de esta decisión**: es `requeridoConVacio()` (el `<h1>` vacío de `esmog`,
 * 2026-08-12) que se aplicó en la config y **nunca llegó a una migración**, así
 * que el diff config↔DB lo arrastra a la primera que pase por aquí. Se deja
 * —la DB tiene que cuadrar con la config— pero **se dice**, porque una
 * migración de `productos` que toca `terminos_kunakpedia` sin explicarlo es
 * exactamente un cambio inatribuible.
 */
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

/** Las filas que la medida de `qa:productos-hueco` cubre. */
const FILAS_MEDIDAS = 9

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_productos_pagina" AS ENUM('propia', 'ninguna');
    ALTER TABLE "productos" ADD COLUMN "pagina" "enum_productos_pagina";
    ALTER TABLE "productos" ADD COLUMN "href_servido" varchar;
    ALTER TABLE "productos" ALTER COLUMN "seo_title" DROP NOT NULL;
    -- deriva ajena, ver la cabecera: requeridoConVacio() del termino esmog
    ALTER TABLE "terminos_kunakpedia" ALTER COLUMN "titulo" DROP NOT NULL;`)

  const { rows } = await db.execute<{ n: string }>(sql`SELECT count(*)::text AS n FROM "productos";`)
  const n = Number(rows?.[0]?.n ?? NaN)
  if (!Number.isFinite(n))
    throw new Error('CMS-PR3: no se pudo contar `productos`. Sin el recuento no hay premisa que comprobar.')
  if (n !== 0 && n !== FILAS_MEDIDAS)
    throw new Error(
      `CMS-PR3: \`productos\` tiene ${n} filas y la medida que respalda el relleno cubre ${FILAS_MEDIDAS} ` +
        `(las de \`src/lib/products.ts\`, todas con página propia según qa:productos-hueco).\n` +
        `  Rellenar a ciegas marcaría como «con página» documentos que quizá no la tienen, que es\n` +
        `  justo el defecto que esta migración cierra. Revisa qué hay en la tabla antes de seguir.`,
    )
  if (n === FILAS_MEDIDAS) {
    payload.logger.info(`CMS-PR3: rellenando \`pagina = propia\` en las ${n} filas medidas.`)
    await db.execute(sql`UPDATE "productos" SET "pagina" = 'propia' WHERE "pagina" IS NULL;`)
  }

  await db.execute(sql`ALTER TABLE "productos" ALTER COLUMN "pagina" SET NOT NULL;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "productos" DROP COLUMN "pagina";
    ALTER TABLE "productos" DROP COLUMN "href_servido";
    ALTER TABLE "productos" ALTER COLUMN "seo_title" SET NOT NULL;
    ALTER TABLE "terminos_kunakpedia" ALTER COLUMN "titulo" SET NOT NULL;
    DROP TYPE "public"."enum_productos_pagina";`)
}
