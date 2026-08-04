// ⚠ `migrate:create` emite `import { MigrateUpArgs, MigrateDownArgs, sql }`, y
// este paquete compila con `verbatimModuleSyntax`: los dos primeros son TIPOS y
// hay que importarlos como tales. **Hay que rehacerlo en cada migración nueva**
// — lo caza el typecheck de `npm run check`, así que el olvido sale rojo.
//
// ══════════════════════════════════════════════════════════════════════════
// QUÉ TRAE ESTA MIGRACIÓN — son DOS cosas, y decirlo importa porque una de las
// dos no la pidió esta tanda.
//
// 1 · **`nivel` del `titular` pasa a defecto 3** (6 columnas). El render lee el
//     claim con `?? 2` y el titular con `?? 3` (`MonoCuerpo.tsx` l. 100/281 y
//     156/275), y el esquema les daba UN defecto compartido de 2. Con eso, el
//     hook de `conDefecto` —*coincidir con el defecto = no haber escrito*—
//     omitía el `nivel: 2` explícito de un titular y el render lo devolvía como
//     `<h3>`. Lo cazó `qa:cms-roundtrip` y no podía verlo ninguna otra guarda:
//     `payload-types` y `qa:cms-campos` miran la RUTA del campo, no su DEFECTO.
//     Acta en `bloques/contenido.ts` (`nivelCon`).
//
// 2 · **`claim` deja de ser NOT NULL** (3 columnas `*_blocks_claim_2`). Esto NO
//     es nuevo: lo decidió la tanda anterior —el dato medido trae `{claim: ""}`
//     y `MonoCuerpo.tsx` lo pinta como un heading vacío que ocupa su
//     interlínea— pero **se cambió en la config y no se emitió su migración**,
//     así que el esquema versionado seguía diciendo `NOT NULL`. Con `push:
//     false` eso significa que una DB migrada desde cero y la config
//     discrepaban. No se separa en otra migración a posteriori: se declara aquí
//     y se dice de quién es.
// ══════════════════════════════════════════════════════════════════════════
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "monograficos_blocks_titular" ALTER COLUMN "nivel" SET DEFAULT 3;
  ALTER TABLE "monograficos_blocks_claim_2" ALTER COLUMN "claim" DROP NOT NULL;
  ALTER TABLE "monograficos_blocks_titular_2" ALTER COLUMN "nivel" SET DEFAULT 3;
  ALTER TABLE "productos_blocks_titular" ALTER COLUMN "nivel" SET DEFAULT 3;
  ALTER TABLE "productos_blocks_claim_2" ALTER COLUMN "claim" DROP NOT NULL;
  ALTER TABLE "productos_blocks_titular_2" ALTER COLUMN "nivel" SET DEFAULT 3;
  ALTER TABLE "articulos_kb_blocks_titular" ALTER COLUMN "nivel" SET DEFAULT 3;
  ALTER TABLE "articulos_kb_blocks_claim_2" ALTER COLUMN "claim" DROP NOT NULL;
  ALTER TABLE "articulos_kb_blocks_titular_2" ALTER COLUMN "nivel" SET DEFAULT 3;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "monograficos_blocks_titular" ALTER COLUMN "nivel" SET DEFAULT 2;
  ALTER TABLE "monograficos_blocks_claim_2" ALTER COLUMN "claim" SET NOT NULL;
  ALTER TABLE "monograficos_blocks_titular_2" ALTER COLUMN "nivel" SET DEFAULT 2;
  ALTER TABLE "productos_blocks_titular" ALTER COLUMN "nivel" SET DEFAULT 2;
  ALTER TABLE "productos_blocks_claim_2" ALTER COLUMN "claim" SET NOT NULL;
  ALTER TABLE "productos_blocks_titular_2" ALTER COLUMN "nivel" SET DEFAULT 2;
  ALTER TABLE "articulos_kb_blocks_titular" ALTER COLUMN "nivel" SET DEFAULT 2;
  ALTER TABLE "articulos_kb_blocks_claim_2" ALTER COLUMN "claim" SET NOT NULL;
  ALTER TABLE "articulos_kb_blocks_titular_2" ALTER COLUMN "nivel" SET DEFAULT 2;`)
}
