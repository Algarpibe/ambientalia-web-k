#!/usr/bin/env node
/**
 * Assets del GRUPO C — las 6 instancias que puebla C-3.
 *
 *   node scripts/download-grupo-c.mjs [--dry-run]
 *
 * `download-assets.mjs` descubre los assets **rastreando la home**, así que no
 * ve los de una página de detalle. Éste va a la inversa: la lista sale de
 * `scripts/qa/medidas/c-spec.json`, que es la transcripción congelada del
 * original — o sea, **de la salida servida y no de una lista a mano**, que es la
 * misma regla que aplican `enlaces.mjs` y `clon-base.mjs` con el manifiesto del
 * build. Si mañana se puebla un caso más, se añade a la sonda y sus imágenes
 * entran solas.
 *
 * Espeja `wp-content/uploads/...` bajo `public/images/uploads/...`, como el
 * script de la home, para que las rutas del clon sean un prefijo del original.
 */
import { mkdir, writeFile, access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { constants } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(__dirname, "..");
const PUBLIC = join(RAIZ, "public");
const DRY = process.argv.includes("--dry-run");
const UA = "Mozilla/5.0 (compatible; KunakWebClone/1.0; +https://github.com/Ambientalia)";

const spec = JSON.parse(await readFile(join(__dirname, "qa/medidas/c-spec.json"), "utf8"));

/** Toda URL de `kunakair.com/wp-content/uploads/` que cite la transcripción. */
const urls = new Set();
for (const p of Object.values(spec.paginas)) {
  if (p.seo?.ogImage) urls.add(p.seo.ogImage);
  for (const g of p.campos?.galeria || []) urls.add(g.src);
  for (const s of p.campos?.soluciones || []) if (s.panel?.img) urls.add(s.panel.img);
}

const lista = [...urls].filter((u) => u?.includes("/wp-content/uploads/"));
console.log(`${lista.length} assets del grupo C (de ${urls.size} URLs citadas)`);

let ok = 0, saltados = 0, fallos = 0;
for (const url of lista) {
  const rel = url.split("/wp-content/uploads/")[1];
  const destino = join(PUBLIC, "images", "uploads", rel);
  try {
    await access(destino, constants.F_OK);
    saltados++;
    continue;
  } catch { /* no está: se baja */ }
  if (DRY) { console.log("  [dry]", rel); ok++; continue; }
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(60000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    await mkdir(dirname(destino), { recursive: true });
    await writeFile(destino, Buffer.from(await r.arrayBuffer()));
    ok++;
    process.stdout.write(`  ✓ ${rel}\n`);
  } catch (e) {
    fallos++;
    process.stdout.write(`  ✗ ${rel}  ${String(e).slice(0, 80)}\n`);
  }
}
console.log(`\n${fallos === 0 ? "✅" : "❌"} ${ok} bajados · ${saltados} ya estaban · ${fallos} fallos`);
process.exit(fallos === 0 ? 0 : 1);
