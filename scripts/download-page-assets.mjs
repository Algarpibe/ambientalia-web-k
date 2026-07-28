#!/usr/bin/env node
/**
 * Descarga los assets de UNA página del original, respejando la estructura de
 * rutas de `wp-content/uploads/…` bajo `public/images/uploads/…`.
 *
 *   node scripts/download-page-assets.mjs <url> [--dry-run] [--force]
 *
 * `scripts/download-assets.mjs` solo mira la home (su `HOME` está cableado);
 * este es el equivalente para una página cualquiera, que es lo que hace falta
 * al clonar una ruta nueva. Descubre:
 *   · <img src> y cada entrada de srcset
 *   · background-image: url(...) en atributos style inline
 *
 * Por defecto **salta lo que ya existe** (los assets compartidos entre páginas
 * ya están en el repo); `--force` vuelve a bajarlos.
 */

import { mkdir, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { constants } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "..", "public");
const USER_AGENT =
  "Mozilla/5.0 (compatible; KunakWebClone/1.0; +https://github.com/Ambientalia)";
const CONCURRENCY = 6;

const [url, ...flags] = process.argv.slice(2);
const DRY_RUN = flags.includes("--dry-run");
const FORCE = flags.includes("--force");

if (!url) {
  console.error("uso: node scripts/download-page-assets.mjs <url> [--dry-run] [--force]");
  process.exit(1);
}

async function exists(p) {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/** `https://kunakair.com/wp-content/uploads/a/b.jpg` → `public/images/uploads/a/b.jpg` */
function localPath(assetUrl) {
  const u = new URL(assetUrl);
  const m = u.pathname.match(/\/wp-content\/uploads\/(.+)$/);
  if (m) return join(PUBLIC_DIR, "images", "uploads", m[1]);
  const t = u.pathname.match(/\/wp-content\/themes\/[^/]+\/assets\/images\/(.+)$/);
  if (t) return join(PUBLIC_DIR, "images", "theme", t[1]);
  return null; // fuera de los dos árboles que refleja el repo
}

const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
const html = await res.text();

const found = new Set();
const push = (raw) => {
  if (!raw) return;
  const clean = raw.trim().replace(/^["']|["']$/g, "");
  if (!clean || clean.startsWith("data:")) return;
  try {
    const abs = new URL(clean, url);
    if (abs.hostname.endsWith("kunakair.com")) found.add(abs.toString());
  } catch {
    /* ignore */
  }
};

for (const m of html.matchAll(/<img[^>]+src=["']([^"']+)["']/g)) push(m[1]);
for (const m of html.matchAll(/srcset=["']([^"']+)["']/g))
  for (const part of m[1].split(",")) push(part.trim().split(/\s+/)[0]);
for (const m of html.matchAll(/background-image:\s*[^;"']*url\(([^)]+)\)/g)) push(m[1]);

const jobs = [];
for (const asset of found) {
  const dest = localPath(asset);
  if (!dest) continue;
  jobs.push({ asset, dest });
}

console.log(`${found.size} referencias · ${jobs.length} dentro del árbol del repo`);

let bajados = 0, saltados = 0, fallos = 0;
async function run({ asset, dest }) {
  if (!FORCE && (await exists(dest))) {
    saltados++;
    return;
  }
  if (DRY_RUN) {
    console.log("  [dry] " + asset);
    bajados++;
    return;
  }
  try {
    const r = await fetch(asset, { headers: { "User-Agent": USER_AGENT } });
    if (!r.ok) throw new Error(`${r.status}`);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, new Uint8Array(await r.arrayBuffer()));
    console.log("  ✓ " + dest.replace(PUBLIC_DIR, "public"));
    bajados++;
  } catch (e) {
    console.error("  ✗ " + asset + " — " + e.message);
    fallos++;
  }
}

for (let i = 0; i < jobs.length; i += CONCURRENCY) {
  await Promise.all(jobs.slice(i, i + CONCURRENCY).map(run));
}
console.log(`\nbajados ${bajados} · ya estaban ${saltados} · fallos ${fallos}`);
