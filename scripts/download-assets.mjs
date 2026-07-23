#!/usr/bin/env node
/**
 * Downloads every asset used by the Kunak homepage into `public/`.
 *
 *   node scripts/download-assets.mjs                 # download all
 *   node scripts/download-assets.mjs --dry-run       # list only
 *   node scripts/download-assets.mjs --skip-existing # skip files already saved
 *
 * Discovery strategy (server-side, so it doesn't depend on the browser):
 *   1. Fetch https://kunakair.com/es/ HTML.
 *   2. Regex out every <img src>, srcset entry, <link href> favicon and inline
 *      background-image url(...).
 *   3. Fetch every linked stylesheet and pull further url(...) references
 *      (webfonts, sector card backgrounds, etc.).
 *   4. Restrict to kunakair.com hosts (skip 3rd-party analytics / consent).
 *   5. Mirror the site's `wp-content/uploads/...` path structure under
 *      `public/images/uploads/...` so multiple resized variants keep their
 *      original relative layout.
 *   6. Download 6 at a time with progress logging.
 */

import { mkdir, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { constants } from "node:fs";

const HOME = "https://kunakair.com/es/";
const ROOT = "https://kunakair.com";
const CONCURRENCY = 6;
const USER_AGENT =
  "Mozilla/5.0 (compatible; KunakWebClone/1.0; +https://github.com/Ambientalia)";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const PUBLIC_DIR = join(PROJECT_ROOT, "public");
const IMAGES_DIR = join(PUBLIC_DIR, "images");
const SEO_DIR = join(PUBLIC_DIR, "seo");

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");
const SKIP_EXISTING = args.has("--skip-existing");

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return await res.text();
}

async function fetchBinary(url) {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  return buf;
}

// ---------------------------------------------------------------------------
// URL discovery
// ---------------------------------------------------------------------------

function normalizeUrl(raw, base) {
  if (!raw) return null;
  const url = raw.trim().replace(/^["']|["']$/g, "");
  if (!url || url.startsWith("data:") || url.startsWith("javascript:"))
    return null;
  try {
    return new URL(url, base).toString();
  } catch {
    return null;
  }
}

function pushIfKunak(set, url) {
  if (!url) return;
  try {
    const u = new URL(url);
    if (u.hostname.endsWith("kunakair.com")) set.add(u.toString());
  } catch {
    /* ignore */
  }
}

async function discoverAssets() {
  const html = await fetchText(HOME);
  const assets = new Set();
  const stylesheets = new Set();

  // <img src="...">
  for (const m of html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
    pushIfKunak(assets, normalizeUrl(m[1], HOME));
  }
  // <img srcset="url 480w, url 980w">
  for (const m of html.matchAll(/<img[^>]+srcset=["']([^"']+)["']/gi)) {
    for (const entry of m[1].split(",")) {
      const url = entry.trim().split(/\s+/)[0];
      pushIfKunak(assets, normalizeUrl(url, HOME));
    }
  }
  // <source srcset=...>
  for (const m of html.matchAll(/<source[^>]+srcset=["']([^"']+)["']/gi)) {
    for (const entry of m[1].split(",")) {
      const url = entry.trim().split(/\s+/)[0];
      pushIfKunak(assets, normalizeUrl(url, HOME));
    }
  }
  // <link rel="icon|apple-touch-icon|manifest" href="...">
  for (const m of html.matchAll(
    /<link[^>]+rel=["'](?:[^"']*(?:icon|apple-touch-icon|manifest|image_src)[^"']*)["'][^>]+href=["']([^"']+)["']/gi
  )) {
    pushIfKunak(assets, normalizeUrl(m[1], HOME));
  }
  for (const m of html.matchAll(
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:[^"']*(?:icon|apple-touch-icon|manifest|image_src)[^"']*)["']/gi
  )) {
    pushIfKunak(assets, normalizeUrl(m[1], HOME));
  }
  // <link rel="stylesheet" href="...">
  for (const m of html.matchAll(
    /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi
  )) {
    const url = normalizeUrl(m[1], HOME);
    if (url) stylesheets.add(url);
  }
  for (const m of html.matchAll(
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']stylesheet["']/gi
  )) {
    const url = normalizeUrl(m[1], HOME);
    if (url) stylesheets.add(url);
  }
  // Inline url(...) in style tags
  for (const styleMatch of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    for (const m of styleMatch[1].matchAll(/url\(([^)]+)\)/gi)) {
      pushIfKunak(assets, normalizeUrl(m[1], HOME));
    }
  }
  // Inline url(...) in style="..." attributes
  for (const m of html.matchAll(/style=["'][^"']*url\(([^)]+)\)/gi)) {
    pushIfKunak(assets, normalizeUrl(m[1], HOME));
  }
  // og:image, twitter:image
  for (const m of html.matchAll(
    /<meta[^>]+(?:property|name)=["'][^"']*image[^"']*["'][^>]+content=["']([^"']+)["']/gi
  )) {
    pushIfKunak(assets, normalizeUrl(m[1], HOME));
  }

  // Follow same-origin stylesheets for further asset references
  for (const cssUrl of stylesheets) {
    try {
      const cssHost = new URL(cssUrl).hostname;
      if (!cssHost.endsWith("kunakair.com")) continue;
      const css = await fetchText(cssUrl);
      for (const m of css.matchAll(/url\(([^)]+)\)/gi)) {
        pushIfKunak(assets, normalizeUrl(m[1], cssUrl));
      }
    } catch (err) {
      console.warn(`  ⚠ Could not read stylesheet ${cssUrl}: ${err.message}`);
    }
  }

  // Manually seeded assets we know about from the recon phase in case
  // they're behind a lazy-load skeleton and never render server-side.
  const seeded = [
    "https://kunakair.com/wp-content/uploads/2023/07/imagen-banner-principal-2-1-1.webp",
    "https://kunakair.com/wp-content/uploads/2022/12/kunak-air-pro-aislado.png",
    "https://kunakair.com/wp-content/uploads/2022/12/01-Kunak-AIR-Pro-300.jpg",
    "https://kunakair.com/wp-content/uploads/2022/12/Kunak_AIR_Lite-300.jpg",
    "https://kunakair.com/wp-content/uploads/2023/01/air-cloud.jpg",
    "https://kunakair.com/wp-content/uploads/2026/04/kunak-api.jpg",
    "https://kunakair.com/wp-content/uploads/2023/03/kunak-air-accessories.jpg",
    "https://kunakair.com/wp-content/uploads/2023/01/cartridges-300.jpg",
    "https://kunakair.com/wp-content/uploads/2023/01/urban-2.svg",
    "https://kunakair.com/wp-content/uploads/2023/01/industry.svg",
    "https://kunakair.com/wp-content/uploads/2026/04/wastewater-treatment-plant.svg",
    "https://kunakair.com/wp-content/uploads/2026/04/oil-and-gas.svg",
    "https://kunakair.com/wp-content/uploads/2023/02/ports-airports-2.svg",
    "https://kunakair.com/wp-content/uploads/2023/01/construction.svg",
    "https://kunakair.com/wp-content/uploads/2023/01/mining.svg",
    "https://kunakair.com/wp-content/uploads/2023/01/research.svg",
    "https://kunakair.com/wp-content/uploads/2023/02/real-time.svg",
    "https://kunakair.com/wp-content/uploads/2023/01/Mcerts.svg",
    "https://kunakair.com/wp-content/uploads/2023/02/data-quality-1.svg",
    "https://kunakair.com/wp-content/uploads/2023/02/global-presence.svg",
    "https://kunakair.com/wp-content/uploads/2023/02/years-of-experience-1.svg",
  ];
  for (const url of seeded) assets.add(url);

  return [...assets].sort();
}

// ---------------------------------------------------------------------------
// Path mapping
// ---------------------------------------------------------------------------

function localPathFor(assetUrl) {
  const u = new URL(assetUrl);
  // Favicons and manifest land under public/seo/
  const isFavicon =
    /(favicon|apple-touch-icon|android-chrome|mstile|site\.webmanifest|browserconfig)/i.test(
      u.pathname
    );
  if (isFavicon) {
    const name = u.pathname.split("/").pop() || "favicon.ico";
    return join(SEO_DIR, name);
  }
  // Font files land under public/fonts/
  if (/\.(woff2?|ttf|otf|eot)(\?|$)/i.test(u.pathname)) {
    const name = u.pathname.split("/").pop();
    return join(PUBLIC_DIR, "fonts", name);
  }
  // Uploaded images preserve their WordPress folder structure
  if (u.pathname.startsWith("/wp-content/uploads/")) {
    const rel = u.pathname.replace(/^\/wp-content\/uploads\//, "");
    return join(IMAGES_DIR, "uploads", rel);
  }
  // Other kunakair assets: preserve full path under images/other/
  return join(IMAGES_DIR, "other", u.pathname.replace(/^\/+/, ""));
}

async function pathExists(p) {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Downloader
// ---------------------------------------------------------------------------

async function downloadOne(url, index, total) {
  const dest = localPathFor(url);
  if (SKIP_EXISTING && (await pathExists(dest))) {
    console.log(`  [${index}/${total}] ⏭  ${url.replace(ROOT, "")}`);
    return { url, status: "skipped" };
  }
  try {
    const buf = await fetchBinary(url);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, buf);
    console.log(
      `  [${index}/${total}] ✓ ${url.replace(ROOT, "")}  (${(
        buf.length / 1024
      ).toFixed(1)} KB)`
    );
    return { url, status: "ok", bytes: buf.length };
  } catch (err) {
    console.warn(
      `  [${index}/${total}] ✗ ${url.replace(ROOT, "")} — ${err.message}`
    );
    return { url, status: "failed", error: err.message };
  }
}

async function runPool(urls) {
  const results = [];
  let cursor = 0;
  const total = urls.length;
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (cursor < urls.length) {
      const i = cursor++;
      results[i] = await downloadOne(urls[i], i + 1, total);
    }
  });
  await Promise.all(workers);
  return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

(async function main() {
  console.log("→ Discovering assets from", HOME);
  const urls = await discoverAssets();
  console.log(`  Found ${urls.length} unique kunakair.com assets.`);

  if (DRY_RUN) {
    console.log("\n--- dry run ---");
    urls.forEach((u) => console.log("  " + u));
    return;
  }

  await mkdir(PUBLIC_DIR, { recursive: true });
  await mkdir(IMAGES_DIR, { recursive: true });
  await mkdir(SEO_DIR, { recursive: true });

  console.log(`\n→ Downloading (concurrency=${CONCURRENCY})…`);
  const results = await runPool(urls);
  const ok = results.filter((r) => r?.status === "ok").length;
  const skipped = results.filter((r) => r?.status === "skipped").length;
  const failed = results.filter((r) => r?.status === "failed").length;
  const bytes = results.reduce((n, r) => n + (r?.bytes || 0), 0);
  console.log(
    `\n✓ Done. ${ok} downloaded, ${skipped} skipped, ${failed} failed. Total ${(
      bytes /
      1024 /
      1024
    ).toFixed(2)} MB.`
  );
  if (failed) {
    console.log(
      `\nFailed URLs:\n${results
        .filter((r) => r?.status === "failed")
        .map((r) => "  " + r.url)
        .join("\n")}`
    );
  }
})().catch((err) => {
  console.error("✗ Fatal:", err);
  process.exit(1);
});
