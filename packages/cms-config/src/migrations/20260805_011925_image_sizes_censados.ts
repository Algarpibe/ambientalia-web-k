// ⚠ `migrate:create` emite `import { MigrateUpArgs, MigrateDownArgs, sql }`, y
// este paquete compila con `verbatimModuleSyntax`: los dos primeros son TIPOS y
// hay que importarlos como tales. **Hay que rehacerlo en cada migración nueva**
// — lo caza el typecheck de `npm run check`, así que el olvido sale rojo.
//
// ══════════════════════════════════════════════════════════════════════════
// LOS IMAGE SIZES, CENSADOS — y ojo, porque esta migración expresa MENOS de lo
// que la tanda cambió, y eso hay que decirlo o el esquema versionado se lee
// como el acta completa.
//
// **Lo que SÍ está aquí (12 columnas + 2 índices):** las dos cajas nuevas,
// `w300` y `w768`. Salen del censo de las 309 páginas del corpus
// (`qa:media-srcset`, `medidas/media-srcset.json`): las dos aparecen en el
// CUERPO —6 y 1 candidatos— y no estaban declaradas. Pocas, sí; el criterio es
// «el corpus lo usa en el cuerpo», no la frecuencia, y una imagen sin su
// variante es exactamente el defecto que M-IMG describe.
//
// **Lo que NO puede estar aquí, y es el cambio que más pesa:** `card` pasa de
// `{width: 1024, height: 683}` a `{width: 1024}`. **No mueve una sola columna**
// —el nombre de la variante no cambia— pero cambia lo que sharp GENERA: con los
// dos lados declarados el `fit` por defecto de Payload es `cover`, o sea que
// recortaba a 3:2 todo lo que entrara. Medido: la caja de 1024 del original
// emite **10 formas WxH distintas** (1024x682 · 1024x1024 · 1024x576 ·
// 1024x683 · 1024x797 …), o sea que conserva la proporción de cada imagen.
// `1024x683` era UNA de las diez, no la forma de la caja.
//
// > Una migración de esquema **no distingue «no cambió nada» de «cambió algo
// > que no vive en el esquema»**. Es la misma clase que *documentado no es
// > conectado*, aplicada al versionado: sin esta nota, la próxima tanda leería
// > el diff de columnas como el alcance del cambio. El acta con su evidencia
// > está en `defaults.ts` (IMAGE_SIZES) y en ESQUEMA §CMS-0b.
//
// ⚠ **Y el sello del nombre es UTC, no local.** Se creó el **2026-08-04** a las
// 20:19 hora local y el fichero se llama `20260805_0119`. Lo pone el generador
// de Payload, no este repo — `hoy()`/`sello()` de `lib.mjs` existen justamente
// por este defecto (`CLAUDE.md` §La fecha de una medida). No se renombra para
// no romper el orden que Payload ya registró, pero **la fecha real de esta
// migración es el 04**, y es la que hay que citar.
// ══════════════════════════════════════════════════════════════════════════
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "sizes_w300_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_w300_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_w300_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_w300_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_w300_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_w300_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_w768_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_w768_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_w768_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_w768_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_w768_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_w768_filename" varchar;
  CREATE INDEX "media_sizes_w300_sizes_w300_filename_idx" ON "media" USING btree ("sizes_w300_filename");
  CREATE INDEX "media_sizes_w768_sizes_w768_filename_idx" ON "media" USING btree ("sizes_w768_filename");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "media_sizes_w300_sizes_w300_filename_idx";
  DROP INDEX "media_sizes_w768_sizes_w768_filename_idx";
  ALTER TABLE "media" DROP COLUMN "sizes_w300_url";
  ALTER TABLE "media" DROP COLUMN "sizes_w300_width";
  ALTER TABLE "media" DROP COLUMN "sizes_w300_height";
  ALTER TABLE "media" DROP COLUMN "sizes_w300_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_w300_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_w300_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_w768_url";
  ALTER TABLE "media" DROP COLUMN "sizes_w768_width";
  ALTER TABLE "media" DROP COLUMN "sizes_w768_height";
  ALTER TABLE "media" DROP COLUMN "sizes_w768_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_w768_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_w768_filename";`)
}
