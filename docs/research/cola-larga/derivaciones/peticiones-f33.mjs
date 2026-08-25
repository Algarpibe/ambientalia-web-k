/* peticiones-f33 — 106.ª tanda, 2026-08-25. EL INVENTARIO DE CANALES QUE UN
 * LADO CARGA Y EL OTRO NO.
 *
 * ── Por qué existe ────────────────────────────────────────────────────────
 * La 105.ª fichó que `f33-cmp` pone `setRequestInterception` **en un solo
 * lado**, y lo tituló «el artefacto de IMAGEN» porque la imagen es lo que se
 * vio: 65 de 71 a 16 px. Pero §regla 32 no dice *«arregla la imagen»*, dice:
 *
 *   > **la lista de lo que se aplica a un lado se aplica al otro, Y SE
 *   > ENUMERA**: intercepción de red, asentado, viewport, emulación, esperas.
 *
 * Enumerar es justo lo que no se había hecho. «La imagen» es **lo primero que
 * encontré**, no **lo que hay** (§sondas 27: un proceso que se para en el
 * primer hallazgo contesta *«hay al menos uno»*, nunca *«hay N»*). Y aquí el
 * proceso que se paró fue la lectura: se miró el `<img>` porque medía 16 px, y
 * un canal que NO deja un rastro visible —una fuente que no carga— no tiene
 * síntoma que mirar. Sigue moviendo todos los altos.
 *
 * ── Qué hace ──────────────────────────────────────────────────────────────
 * Monta el lado del ORIGINAL **exactamente como lo monta `f33-cmp` hoy** y
 * anota **cada petición abortada** con su `resourceType` y su host. No mide
 * geometría: mide **qué canales están cortados en el lado del original y no en
 * el del clon**.
 *
 * ── Qué NO contesta ───────────────────────────────────────────────────────
 * · **No dice cuánto mueve cada canal.** Dice cuáles hay. El cuánto lo da el
 *   antes/después del comparador con el canal cerrado;
 * · **no mira el lado del clon**: hoy el clon no intercepta NADA, así que su
 *   inventario de bloqueos es 0 por construcción y el dato interesante es qué
 *   pide **fuera de su propio origen**. Eso se deriva del HTML del clon, no de
 *   aquí, y esta derivación lo declara como hueco.
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "../../../..");
const CORPUS = join(RAIZ, "corpus/fase-3");
const CSS = join(RAIZ, "corpus/css");

const { censaPaginasF33 } = await import(pathToFileURL(join(AQUI, "arbol-f33.mjs")).href);
const TODAS = censaPaginasF33();
if (!TODAS.length) throw new Error("DOMINIO VACÍO (§sondas 4)");

const INDICE = JSON.parse(readFileSync(join(CSS, "INDICE.json"), "utf8"));
const LOCAL = new Set(Object.keys(INDICE.ficheros));
if (!LOCAL.size) throw new Error("ÍNDICE DE HOJAS VACÍO (§sondas 4)");

/* La MISMA reescritura de hojas que `f33-cmp`: si aquí se montara de otro modo,
 * el inventario sería de otra página. */
function conHojasLocales(html) {
  return html.replace(/<link\b[^>]*>/gi, (tag) => {
    if (!/rel=["']?stylesheet/i.test(tag)) return tag;
    const href = (/href=["']([^"']+)["']/i.exec(tag) || [])[1];
    if (!href) return tag;
    const rel = href.replace(/^https?:\/\/kunakair\.com\//, "").split("?")[0];
    if (!LOCAL.has(rel)) return tag;
    return tag.replace(/href=["'][^"']+["']/i, `href="${pathToFileURL(join(CSS, rel)).href}"`);
  });
}

const CHROME = process.env.CHROME_PATH
  || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage",
    "--host-resolver-rules=MAP consent.cookiebot.com 127.0.0.1,MAP consentcdn.cookiebot.com 127.0.0.1"],
});

const porTipo = new Map(), porHost = new Map(), porExt = new Map();
const muestras = new Map();
let paginas = 0, total = 0;

for (const pg of TODAS) {
  const f = join(CORPUS, pg.fichero);
  if (!existsSync(f)) { console.log("AUSENTE", pg.ruta); continue; }
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.setRequestInterception(true);
  page.on("request", (q) => {
    const u = q.url();
    if (u.startsWith("file:") || u.startsWith("data:")) return void q.continue();
    total++;
    const t = q.resourceType();
    porTipo.set(t, (porTipo.get(t) || 0) + 1);
    let h = "(?)"; try { h = new URL(u).host; } catch { /* noop */ }
    porHost.set(h, (porHost.get(h) || 0) + 1);
    const ext = (/\.([a-z0-9]{2,5})(?:[?#]|$)/i.exec(u.split("/").pop() || "") || [, "(sin ext)"])[1].toLowerCase();
    porExt.set(ext, (porExt.get(ext) || 0) + 1);
    if (!muestras.has(t)) muestras.set(t, u.slice(0, 150));
    q.abort().catch(() => {});
  });
  const html = conHojasLocales(readFileSync(f, "utf8"));
  await page.goto(pathToFileURL(f).href, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.setContent(html, { waitUntil: "networkidle0", timeout: 120_000 });
  await new Promise((r) => setTimeout(r, 800));
  await page.evaluate(async () => {
    for (const img of document.querySelectorAll("img")) { img.loading = "eager"; img.decoding = "sync"; }
    const listas = Promise.all([...document.images].filter((i) => !i.complete)
      .map((i) => new Promise((r) => { i.onload = i.onerror = r; })));
    await Promise.race([listas, new Promise((r) => setTimeout(r, 2000))]);
    if (document.fonts?.ready) await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]);
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
  /* La fuente EFECTIVA del cuerpo: es lo que dice si el canal de fuentes está
   * cortado, y no se ve en ningún recuento de peticiones. */
  const fuente = await page.evaluate(() => {
    const p = document.querySelector("#main-content p, .entry-content p, p");
    return {
      familiaDeclarada: p ? getComputedStyle(p).fontFamily : null,
      manropeCargada: [...document.fonts].some((ff) => /manrope/i.test(ff.family) && ff.status === "loaded"),
      caras: [...document.fonts].map((ff) => `${ff.family}:${ff.status}`).slice(0, 8),
    };
  });
  if (paginas === 0) console.log("fuente en la 1.ª página:", JSON.stringify(fuente));
  paginas++;
  await page.close();
}
await browser.close();

const orden = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]);
const l = [];
l.push("═══ peticiones-f33 · qué ABORTA hoy el lado del ORIGINAL en `f33-cmp`\n");
l.push(`  páginas montadas                         ${paginas} / ${TODAS.length}`);
l.push(`  peticiones abortadas                     ${total}\n`);
l.push("  por resourceType:");
for (const [k, v] of orden(porTipo)) l.push(`    ${k.padEnd(12)} ${String(v).padStart(5)}   p.ej. ${muestras.get(k)}`);
l.push("\n  por host:");
for (const [k, v] of orden(porHost)) l.push(`    ${k.padEnd(28)} ${String(v).padStart(5)}`);
l.push("\n  por extensión:");
for (const [k, v] of orden(porExt)) l.push(`    ${k.padEnd(12)} ${String(v).padStart(5)}`);
const txt = l.join("\n") + "\n";
console.log(txt);
mkdirSync(AQUI, { recursive: true });
writeFileSync(join(AQUI, "peticiones-f33.log"), txt);
