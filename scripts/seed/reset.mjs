/**
 * `npm run cms:reset` — deja la DB **vacía y migrada**, que es la precondición
 * del seed (§F2-2: *«migrate desde cero + seed»*).
 *
 * Dropea el esquema y reaplica las migraciones **versionadas**: no usa `push`,
 * así que lo que queda es exactamente lo que la migración produce — que es la
 * misma propiedad que F2-1 verificó, ejercitada en cada corrida.
 */
import { spawnSync } from "node:child_process";
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
console.log("  ✓ migraciones versionadas aplicadas sobre vacío\n");
