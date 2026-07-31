#!/usr/bin/env node
/**
 * Assets del GRUPO A — las 14 instancias que puebla esta tanda.
 *
 *   node scripts/download-grupo-a.mjs [--dry-run]
 *
 * Igual que `download-grupo-c.mjs`: la lista **no se escribe a mano**, sale de
 * `scripts/qa/medidas/a-spec.json`, que es la transcripción congelada del HTML
 * servido. Si mañana se puebla una entrada más, se añade a la sonda y sus
 * imágenes entran solas — la misma regla que `enlaces.mjs` y `clon-base.mjs`
 * aplican con el manifiesto del build.
 *
 * ── Lo que este grupo añade y el C no tenía ───────────────────────────────
 * En el grupo C las imágenes eran **campos** (galería, ficha de producto): una
 * lista de URLs y ya. Aquí la mayoría viven **dentro del campo rico**, en
 * `<img src>` y sobre todo en `srcset` —123/209 páginas llevan imagen y el
 * `srcset` de WordPress trae hasta 4 variantes por imagen—, así que hay que
 * barrer el HTML del cuerpo, no una lista de campos.
 *
 * Y hay `.mp4`: 8 `<video>` en 8 páginas del corpus (§3.1b). Se bajan igual —
 * están en `wp-content/uploads` como todo lo demás.
 *
 * Espeja `wp-content/uploads/...` bajo `public/images/uploads/...`, como los
 * otros dos scripts, para que la ruta del clon sea un prefijo de la original.
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

const spec = JSON.parse(await readFile(join(__dirname, "qa/medidas/a-spec.json"), "utf8"));

/** Toda URL de `kunakair.com/wp-content/uploads/` que cite la transcripción. */
const urls = new Set();
const añade = (u) => u && urls.add(u);

for (const p of spec.paginas) {
  añade(p.seo?.ogImage);
  for (const img of [p.imagenDestacada, p.portada]) {
    if (!img) continue;
    añade(img.src);
    for (const parte of (img.srcset || "").split(",")) añade(parte.trim().split(/\s+/)[0]);
  }
  const cuerpo = p.cuerpo || "";
  for (const m of cuerpo.matchAll(/(?:src|href|data-src|poster)="([^"]+)"/g)) añade(m[1]);
  for (const m of cuerpo.matchAll(/srcset="([^"]+)"/g))
    for (const parte of m[1].split(",")) añade(parte.trim().split(/\s+/)[0]);
}

const lista = [...urls].filter((u) => u.includes("://kunakair.com/wp-content/uploads/"));
console.log(`${lista.length} assets del grupo A (de ${urls.size} URLs citadas en ${spec.paginas.length} instancias)`);

let ok = 0, saltados = 0, fallos = 0;
for (const url of lista) {
  const rel = decodeURIComponent(url.split("/wp-content/uploads/")[1].split("?")[0]);
  const destino = join(PUBLIC, "images", "uploads", rel);
  try {
    await access(destino, constants.F_OK);
    saltados++;
    continue;
  } catch { /* no está: se baja */ }
  if (DRY) { console.log("  [dry]", rel); ok++; continue; }
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(90000) });
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
