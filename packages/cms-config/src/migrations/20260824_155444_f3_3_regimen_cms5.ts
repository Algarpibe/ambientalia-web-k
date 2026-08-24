/**
 * F3-3 · **CMS-5 = R1** — 100.ª tanda, 2026-08-24. Decisión del propietario del
 * 2026-08-24; enunciado en `ESQUEMA-CMS.md` §2j.8, cierre en §2j.9.
 *
 * `paginas` gana **`regimen`**, derivado del `<body>` del corpus por
 * `regimenDe()` —que el extractor **ya calculaba** para su censo—, así que el
 * dato no exige volver al original ni una lista de rutas que envejezca.
 * Reparto medido: **`B-` 22 · `BT` 8 · `--` 1 · `-T` 0**.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠ LA REVERSA, PROBADA — con su número, y en la unidad TABLA A TABLA
 *
 * Medido el 2026-08-24 sobre la DB poblada por el pipeline completo
 * (`cms:reset` + `cms:seed` 383/14 + `cms:seed-listados` 88/88 + `cms:seed-kb`
 * 6/6), con la migración **en su propio batch** — que es el estado que produce
 * un despliegue incremental y que `cms:reset` colapsa al aplicarlas todas en
 * batch 1:
 *
 * | | filas | tablas | columna | enum | migraciones |
 * |---|---|---|---|---|---|
 * | poblada, `up` aplicada | **4103** | 130 | `NOT NULL` | 4 valores | 21 · batch 2 |
 * | tras `down` | **4102** | 130 | — | — | **20 · batch 1** |
 *
 * **La única línea que se movió en el censo tabla a tabla es
 * `payload_migrations 21 → 20`** —el registro de la propia migración—, y las
 * **31 filas de `paginas` SOBREVIVEN**: un `down` que quita una columna no
 * quita documentos. El control no es el total (§*un cardinal es un contenedor y
 * absorbe la membresía*): `4103 → 4102` sería exacto con dos tablas
 * compensándose, así que lo que prueba es el `diff` línea a línea.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ LA VENTANA DEL `up`, MEDIDA Y NO DEDUCIDA — Y ES LA MITAD QUE HAY QUE SABER
 *
 * `required` es `NOT NULL` en Postgres **sin `defaultValue`**, así que el `up`
 * **sólo corre con `paginas` VACÍA**. No se dedujo de la semántica de SQL: se
 * corrió, **dos veces**, y las dos dieron `exit 1` con
 *
 *     column "regimen" of relation "paginas" contains null values
 *
 * — una antes de aplicarla (31 filas, 20 migraciones) y otra después del `down`
 * (31 filas otra vez). **El rollback fue limpio las dos veces**: censo idéntico
 * línea a línea, 0 tipos enum huérfanos, 0 columnas colgando.
 *
 * **Esto NO es un defecto de la migración: es el esquema diciendo que las 31
 * filas viejas no tienen el valor medido**, y es la razón por la que la reversa
 * se prueba aquí y no «cuando venga bien» (§regla 30). El pipeline no lo sufre
 * porque `cms:reset` dropea el esquema y reaplica las versionadas sobre vacío
 * en cada corrida — verificado: 21 migraciones y `regimen` `NOT NULL`.
 *
 * **Y no se arregla con un `defaultValue`**, que sería la salida cómoda: un
 * defecto benigno serviría las 8 `BT` con el cascarón de las 22 y **nadie se
 * enteraría** (§regla 6, *un valor por defecto convierte «no lo sé» en «está
 * bien»*). El defecto se deja en la dirección que GRITA.
 *
 * ⚠ `payload migrate:down` imprimió *«Rolling back batch 2 consisting of 21
 * migration(s)»* y revirtió **UNA**. El 21 es `existingMigrations.length` —el
 * TOTAL—, no el tamaño del batch: leído en
 * `node_modules/payload/dist/database/migrations/migrateDown.js`, que filtra por
 * `batch === latestBatch` antes de recorrer. Comprobado en `payload_migrations`,
 * no en el log (§*el LOG de la herramienta no es lo que la herramienta hizo*).
 * Es la misma advertencia que dejó D3, ahora con el mecanismo leído en la fuente.
 * ═════════════════════════════════════════════════════════════════════════ */
/* `import type` para los dos tipos: `verbatimModuleSyntax` está activo y
 * `migrate:create` genera el import de valor. Mismo arreglo que las 20
 * anteriores — ver `20260823_190450_f3_3_ancho_quintos_y_media_externa.ts`. */
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_paginas_regimen" AS ENUM('B-', 'BT', '-T', '--');
  ALTER TABLE "paginas" ADD COLUMN "regimen" "enum_paginas_regimen" NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "paginas" DROP COLUMN "regimen";
  DROP TYPE "public"."enum_paginas_regimen";`)
}
