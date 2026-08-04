/**
 * `npm run cms:reset` — deja la DB **vacía y migrada**, que es la precondición
 * del seed (§F2-2: *«migrate desde cero + seed»*).
 *
 * Dropea el esquema y reaplica las migraciones **versionadas**: no usa `push`,
 * así que lo que queda es exactamente lo que la migración produce — que es la
 * misma propiedad que F2-1 verificó, ejercitada en cada corrida.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CMS = path.join(RAIZ, "apps/cms");

const uri = process.env.DATABASE_URI;
if (!uri) throw new Error("DATABASE_URI no está definido.");

/* El contenedor se llama así desde el bloque 2 de F2-1. Se dropea por psql y no
 * por la Local API: `payload migrate:fresh` no borra tipos enum huérfanos. */
const psql = (sql) =>
  spawnSync("docker", ["exec", "kunak-cms-pg", "psql", "-U", "kunak", "-d", "kunak_cms", "-c", sql], {
    encoding: "utf8",
  });

const r = psql("DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO kunak;");
if (r.status !== 0) {
  console.error(r.stderr || r.stdout);
  process.exit(2);
}
console.log("  ✓ esquema dropeado y recreado");

const m = spawnSync("npx", ["payload", "migrate"], { cwd: CMS, encoding: "utf8", shell: true });
process.stdout.write(m.stdout ?? "");
if (m.status !== 0) {
  console.error(m.stderr ?? "");
  process.exit(2);
}
console.log("  ✓ migraciones versionadas aplicadas sobre vacío");

/* ══════════════════════════════════════════════════════════════════════════
 * Y LA OTRA MITAD DE «VACÍA», QUE FALTABA — el directorio de medios.
 *
 * ⚠ **Defecto medido el 2026-08-04, y rompía el determinismo que el seed
 * declara.** `reset` dropeaba el esquema y **dejaba los ficheros**, así que la
 * segunda corrida encontraba el nombre ocupado y Payload subía
 * `…-Kunak-2.jpg`; la tercera, `-3`. Se vio en `git status`: **8 ficheros
 * nuevos que eran la misma imagen tres veces.**
 *
 * O sea que «el seed es determinista» era cierto **de la DB y falso del
 * disco**, y el `url` de cada media —que acaba en el HTML— cambiaba de una
 * corrida a otra. Es el mismo error de nivel de siempre: se comprobó el
 * contenedor que estaba a mano (las filas) y el defecto vivía en el de al lado.
 * ═════════════════════════════════════════════════════════════════════════ */
const { DIR_MEDIA } = await import("../../packages/cms-config/src/colecciones/media.ts");
let borrados = 0;
if (fs.existsSync(DIR_MEDIA)) {
  for (const f of fs.readdirSync(DIR_MEDIA)) {
    if (f === ".gitkeep") continue;
    fs.rmSync(path.join(DIR_MEDIA, f), { recursive: true, force: true });
    borrados++;
  }
}
console.log(`  ✓ ${borrados} fichero(s) de media borrados de ${path.relative(RAIZ, DIR_MEDIA)}\n`);
