/* fuente-f33 — 106.ª tanda, 2026-08-25. CUÁNTO MUEVE LA FUENTE EL LADO DEL
 * ORIGINAL, medido en vez de supuesto.
 *
 * ── Por qué ──────────────────────────────────────────────────────────────
 * `peticiones-f33` enumeró lo que el lado del original aborta hoy y salieron
 * **tres canales, no uno**: imagen (1129), **fuente** (47 peticiones a
 * `fonts.googleapis.com` y `fonts.bunny.net`) y documento (60 iframes). El
 * titular de la 105.ª —«el artefacto de IMAGEN»— nombra **lo que se vio**,
 * porque una imagen rota mide 16 px y se nota; **una fuente que no carga no
 * deja síntoma** y mueve todos los altos igual.
 *
 * Medido allí: `familiaDeclarada: "Manrope, sans-serif"` con
 * **`manropeCargada: false`**. El clon, en cambio, sirve Manrope
 * AUTO-ALOJADA por `next/font/google` (`apps/web/src/app/layout.tsx`), o sea
 * que **los dos lados están componiendo con tipografías distintas**.
 *
 * Esto NO arregla nada: pone el número delante para decidir si cerrar el canal
 * de fuentes entra en el arreglo de simetría o no (§*cuando el cambio se pueda
 * aplicar, aplícalo y mide*).
 *
 * ── Alcance, declarado ───────────────────────────────────────────────────
 * · **NO toca `kunakair.com`.** El único host que se deja pasar en el brazo B
 *   es `fonts.googleapis.com` / `fonts.gstatic.com`: el original sigue fuera
 *   del camino crítico;
 * · muestra de **3 páginas de texto** (las que menos imagen tienen, para que
 *   el Δ que salga sea de tipografía y no de imagen). No es el dominio entero:
 *   contesta *«¿mueve?»* y *«¿cuánto, en este orden de magnitud?»*, no
 *   *«¿cuánto en cada una de las 31?»*;
 * · un ancho (1440). A 390 el reflujo es otro y **no está medido aquí**.
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "../../../..");
const CORPUS = join(RAIZ, "corpus/fase-3");
const CSS = join(RAIZ, "corpus/css");

const { censaPaginasF33 } = await import(pathToFileURL(join(AQUI, "arbol-f33.mjs")).href);
const TODAS = censaPaginasF33();
const INDICE = JSON.parse(readFileSync(join(CSS, "INDICE.json"), "utf8"));
const LOCAL = new Set(Object.keys(INDICE.ficheros));
if (!LOCAL.size) throw new Error("ÍNDICE DE HOJAS VACÍO (§sondas 4)");

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

const MUESTRA = ["/es/aviso-legal/", "/es/politica-de-cookies/", "/es/recursos/kunakpedia/"];
const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars"],
});

async function mide(pg, dejaFuentes) {
  const f = join(CORPUS, pg.fichero);
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.setRequestInterception(true);
  page.on("request", (q) => {
    const u = q.url();
    if (u.startsWith("file:") || u.startsWith("data:")) return void q.continue();
    if (dejaFuentes && /^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(u)) return void q.continue();
    q.abort().catch(() => {});
  });
  await page.goto(pathToFileURL(f).href, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.setContent(conHojasLocales(readFileSync(f, "utf8")), { waitUntil: "networkidle0", timeout: 120_000 });
  await new Promise((r) => setTimeout(r, 800));
  await page.evaluate(async () => {
    for (const i of document.querySelectorAll("img")) { i.loading = "eager"; i.decoding = "sync"; }
    if (document.fonts?.ready) await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 5000))]);
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    window.scrollTo(0, 0);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
  /**
   * ⚠ **`docH` es un TOTAL, y un total puede sumar dos errores que se anulan.**
   * Por eso además del total se anota **cada elemento con caja**, por su
   * camino: el reparto ACERCAN/ALEJAN de un total no se puede leer sin él
   * (§*la causa común: el NIVEL al que se mide*).
   */
  const d = await page.evaluate(() => {
    const camino = (el) => {
      const t = [];
      for (let n = el; n && n.nodeType === 1 && n !== document.documentElement; n = n.parentElement) {
        const i = n.parentElement ? [...n.parentElement.children].indexOf(n) : 0;
        t.unshift(`${n.tagName.toLowerCase()}:${i}`);
      }
      return t.join(">");
    };
    const cajas = {};
    for (const el of document.querySelectorAll("p, h1, h2, h3, h4, li, span, a, div")) {
      const b = el.getBoundingClientRect();
      if (b.width <= 0 || b.height <= 0) continue;
      cajas[camino(el)] = [+b.y.toFixed(2), +b.height.toFixed(2), +b.width.toFixed(2)];
    }
    const p = document.querySelector("#main-content p, .entry-content p, p");
    const h1 = document.querySelector("h1");
    return {
      docH: +document.documentElement.getBoundingClientRect().height.toFixed(2),
      manrope: [...document.fonts].some((ff) => /manrope/i.test(ff.family) && ff.status === "loaded"),
      pH: p ? +p.getBoundingClientRect().height.toFixed(2) : null,
      h1H: h1 ? +h1.getBoundingClientRect().height.toFixed(2) : null,
      cajas,
    };
  });
  await page.close();
  return d;
}

const l = [];
l.push("═══ fuente-f33 · cuánto mueve la TIPOGRAFÍA el lado del original (1440)\n");
l.push("  brazo A = como hoy (todo abortado salvo file:/data:)   → Manrope NO carga");
l.push("  brazo B = idéntico + se deja pasar fonts.googleapis/gstatic → Manrope SÍ carga");
l.push("  (kunakair.com abortado en LOS DOS brazos)\n");
l.push(`  ${"ruta".padEnd(34)} ${"docH A".padStart(9)} ${"docH B".padStart(9)} ${"Δ".padStart(8)}  manrope  ${"cajas".padStart(6)} ${"MOVIDAS".padStart(8)} ${"|Δh| max".padStart(9)} ${"|Δw| max".padStart(9)}`);
let n = 0, movidasTot = 0, cajasTot = 0;
for (const r of MUESTRA) {
  const pg = TODAS.find((p) => p.ruta === r);
  if (!pg || !existsSync(join(CORPUS, pg.fichero))) { l.push(`  ${r} — AUSENTE`); continue; }
  const a = await mide(pg, false);
  const b = await mide(pg, true);
  n++;
  /* La membresía se compara por ELEMENTO, no por cardinal (§*un cardinal es un
   * contenedor y absorbe la membresía*). */
  const claves = new Set([...Object.keys(a.cajas), ...Object.keys(b.cajas)]);
  let movidas = 0, maxH = 0, maxW = 0, soloA = 0, soloB = 0;
  for (const k of claves) {
    const x = a.cajas[k], y = b.cajas[k];
    if (!x) { soloB++; movidas++; continue; }
    if (!y) { soloA++; movidas++; continue; }
    const dh = Math.abs(y[1] - x[1]), dw = Math.abs(y[2] - x[2]), dy = Math.abs(y[0] - x[0]);
    if (dh > 0.01 || dw > 0.01 || dy > 0.01) movidas++;
    if (dh > maxH) maxH = dh;
    if (dw > maxW) maxW = dw;
  }
  movidasTot += movidas; cajasTot += claves.size;
  l.push(`  ${r.padEnd(34)} ${String(a.docH).padStart(9)} ${String(b.docH).padStart(9)} ${String(+(b.docH - a.docH).toFixed(2)).padStart(8)}  ${a.manrope}→${b.manrope}  ${String(claves.size).padStart(6)} ${String(movidas).padStart(8)} ${maxH.toFixed(2).padStart(9)} ${maxW.toFixed(2).padStart(9)}${soloA || soloB ? `   (sólo A ${soloA} · sólo B ${soloB})` : ""}`);
}
await browser.close();
l.push(`\n  páginas medidas ${n}/${MUESTRA.length} · muestra, no dominio`);
l.push(`  cajas comparadas ${cajasTot} · MOVIDAS ${movidasTot} (${cajasTot ? (100 * movidasTot / cajasTot).toFixed(1) : "—"} %)`);
l.push("\n  ⚠ el veredicto lo da MOVIDAS, no `docH`: un total absorbe signos opuestos.");
const txt = l.join("\n") + "\n";
console.log(txt);
writeFileSync(join(AQUI, "fuente-f33.log"), txt);
