/**
 * F3-3 · **D3 (`1_5` y `1_6`) + D2 (el asset alojado FUERA)** — 98.ª tanda,
 * 2026-08-23. Las dos decisiones son del propietario (2026-08-22).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * D3 · LA RETÍCULA GANA `1_5` Y `1_6`, EN LA MISMA MIGRACIÓN
 *
 * `ancho` es un `select` de Payload, o sea un **tipo enum de Postgres**, así
 * que cada valor nuevo es un `ALTER TYPE … ADD VALUE`. Los dos juntos porque
 * separarlos son dos migraciones sobre el mismo tipo (y la 81.ª ya se comió una
 * que `migrate:create` generó mal).
 *
 * · **`1_5` está EJERCITADO**: 10 instancias, dos filas de cinco columnas en
 *   `/es/servicio-de-reparacion/` (`bloqueos-f33.log` §select — 10 de 173);
 * · **`1_6` entra SIN EJERCITAR, y se dice con su denominador**: 0 de 313
 *   módulos y 0 de 113 filas de la cola larga, 0 en los otros tres arquetipos.
 *   Divi lo sirve; este corpus no lo trae. **SIN EJERCITAR no es 0.**
 *
 * El enum lo comparten **tres** colecciones —`monograficos`, `articulos_kb` y
 * `paginas`— porque `ancho` es LA RETÍCULA y no el enum de los valores vistos.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * D2 · `src_id` DEJA DE SER `NOT NULL` Y APARECE `src_externo`
 *
 * 1 de las 71 imágenes de la cola larga vive en `upload.wikimedia.org`
 * (`/es/empresa/`). El propietario decidió **dejarla absoluta**: es lo que el
 * original sirve, y la regla de no hotlinkear es sobre `kunakair.com`, para no
 * depender del original. `src` es `upload → media` y sólo expresa lo LOCAL, así
 * que hacía falta un canal para el asset de fuera. La obligatoriedad **no
 * desaparece: se mueve** a `validaOrigenImagen`, que exige exactamente uno de
 * los dos (ni cero ni dos).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠ LA REVERSA, PROBADA — y con su número, no con un adjetivo
 *
 * Medido el 2026-08-23, sobre la DB poblada por el pipeline completo y **antes**
 * de sembrar `paginas`:
 *
 * | | filas | tablas | enums `_ancho` | `src_id` | `src_externo` | migraciones |
 * |---|---|---|---|---|---|---|
 * | antes | **3333** | 80 | 8 valores ×3 | `NOT NULL` | — | 19 · batch 1 |
 * | `up` | 3334 | 80 | **10 valores ×3** | `NULL` | `varchar` | 20 · batch 2 |
 * | `down` | **3333** | 80 | 8 valores ×3 | `NOT NULL` | — | **19 · batch 1** |
 *
 * La fila de diferencia entre `up` y los otros dos es **el registro de la propia
 * migración** en `payload_migrations`. Y el control no es el total: el censo
 * **tabla a tabla** de antes y de después de la reversa es **idéntico línea a
 * línea** (`diff` sin salida) — §*un cardinal es un contenedor y absorbe la
 * membresía*: `3333 → 3333` sería exacto con dos tablas compensándose.
 *
 * ⚠ **Y la reversa sólo es limpia MIENTRAS `paginas` no tenga la fila externa.**
 * El `down` hace `src_id SET NOT NULL`, así que con el documento de `empresa`
 * sembrado **fallaría** — y estaría bien que fallara: es el esquema diciendo que
 * el dato ya no cabe en la forma vieja. Por eso la reversa se prueba **aquí**,
 * antes de sembrar, que es donde la pregunta tiene respuesta.
 *
 * ⚠ `payload migrate:down` imprime *«Rolling back batch 2 consisting of 20
 * migration(s)»*. El **20 es de su mensaje, no de lo que hace**: revirtió UNA y
 * las 19 anteriores siguen registradas en batch 1 — comprobado en
 * `payload_migrations`, no leído en el log.
 * ═════════════════════════════════════════════════════════════════════════ */
/* `import type` para los dos tipos: `verbatimModuleSyntax` está activo y
 * `migrate:create` genera el import de valor. Mismo arreglo que las 19
 * anteriores — ver `20260818_193649_f3_fecha_publicacion_orden.ts`. */
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_monograficos_cuerpo_filas_columnas_ancho" ADD VALUE '1_6' BEFORE '1_4';
  ALTER TYPE "public"."enum_monograficos_cuerpo_filas_columnas_ancho" ADD VALUE '1_5' BEFORE '1_4';
  ALTER TYPE "public"."enum_paginas_bloques_filas_columnas_ancho" ADD VALUE '1_6' BEFORE '1_4';
  ALTER TYPE "public"."enum_paginas_bloques_filas_columnas_ancho" ADD VALUE '1_5' BEFORE '1_4';
  ALTER TYPE "public"."enum_articulos_kb_cuerpo_columnas_ancho" ADD VALUE '1_6' BEFORE '1_4';
  ALTER TYPE "public"."enum_articulos_kb_cuerpo_columnas_ancho" ADD VALUE '1_5' BEFORE '1_4';
  ALTER TABLE "paginas_blocks_imagen_pagina" ALTER COLUMN "src_id" DROP NOT NULL;
  ALTER TABLE "paginas_blocks_imagen_pagina" ADD COLUMN "src_externo" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "monograficos_cuerpo_filas_columnas" ALTER COLUMN "ancho" SET DATA TYPE text;
  DROP TYPE "public"."enum_monograficos_cuerpo_filas_columnas_ancho";
  CREATE TYPE "public"."enum_monograficos_cuerpo_filas_columnas_ancho" AS ENUM('1_4', '1_3', '2_5', '1_2', '3_5', '2_3', '3_4', '4_4');
  ALTER TABLE "monograficos_cuerpo_filas_columnas" ALTER COLUMN "ancho" SET DATA TYPE "public"."enum_monograficos_cuerpo_filas_columnas_ancho" USING "ancho"::"public"."enum_monograficos_cuerpo_filas_columnas_ancho";
  ALTER TABLE "paginas_bloques_filas_columnas" ALTER COLUMN "ancho" SET DATA TYPE text;
  DROP TYPE "public"."enum_paginas_bloques_filas_columnas_ancho";
  CREATE TYPE "public"."enum_paginas_bloques_filas_columnas_ancho" AS ENUM('1_4', '1_3', '2_5', '1_2', '3_5', '2_3', '3_4', '4_4');
  ALTER TABLE "paginas_bloques_filas_columnas" ALTER COLUMN "ancho" SET DATA TYPE "public"."enum_paginas_bloques_filas_columnas_ancho" USING "ancho"::"public"."enum_paginas_bloques_filas_columnas_ancho";
  ALTER TABLE "articulos_kb_cuerpo_columnas" ALTER COLUMN "ancho" SET DATA TYPE text;
  DROP TYPE "public"."enum_articulos_kb_cuerpo_columnas_ancho";
  CREATE TYPE "public"."enum_articulos_kb_cuerpo_columnas_ancho" AS ENUM('1_4', '1_3', '2_5', '1_2', '3_5', '2_3', '3_4', '4_4');
  ALTER TABLE "articulos_kb_cuerpo_columnas" ALTER COLUMN "ancho" SET DATA TYPE "public"."enum_articulos_kb_cuerpo_columnas_ancho" USING "ancho"::"public"."enum_articulos_kb_cuerpo_columnas_ancho";
  ALTER TABLE "paginas_blocks_imagen_pagina" ALTER COLUMN "src_id" SET NOT NULL;
  ALTER TABLE "paginas_blocks_imagen_pagina" DROP COLUMN "src_externo";`)
}
