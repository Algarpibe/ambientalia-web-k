/* toggle-f33 — 106.ª tanda, 2026-08-25. LA GEOMETRÍA DEL `toggle` CERRADO,
 * medida sobre el original en vez de leída de una hoja.
 *
 * ── Por qué ──────────────────────────────────────────────────────────────
 * El clon **ya emite** `et_pb_toggle_close`, y la clase es **INERTE**: el clon
 * no reproduce el CSS compilado de Divi, así que la clase está en el HTML
 * servido y no llega a ninguna propiedad. Es §*el HTML sirve una clase que no
 * hace nada* — el marcador de frescura da verde y el cambio no existe.
 *
 * Medido por `f33-cmp`: el original sirve los **10 toggles a 63 px, uniforme**;
 * el clon los pinta a `254.16 ×5 · 131.78 ×2 · 223.56 ×2 · 101.19 ×1`.
 *
 * ── Y por qué NO se resuelve con `grep` sobre la hoja ────────────────────
 * §*transcribir la declaración servida no es transcribir la CASCADA*: `grep`
 * contesta *«¿existe esta declaración?»* y la pregunta es *«¿cuál GANA?»*.
 * Aquí se le pregunta al navegador, sobre el documento montado igual que lo
 * monta el comparador (hojas + media + fuentes locales).
 *
 * ── Qué NO contesta ──────────────────────────────────────────────────────
 * · **No dice si «abierto por defecto» es un CAMPO.** Los 10 están cerrados y
 *   varianza cero **no prueba plantilla** (§F3-3-TOGGLE-ABIERTO sigue abierta);
 * · un ancho por corrida.
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "../../../..");
const CORPUS = join(RAIZ, "corpus/fase-3");
const CSS = join(RAIZ, "corpus/css");
const FUENTES = join(RAIZ, "corpus/fuentes");
const ANCHO = Number(process.argv[2] || 1440);

const { censaPaginasF33 } = await import(pathToFileURL(join(AQUI, "arbol-f33.mjs")).href);
const TODAS = censaPaginasF33();
const LOCAL = new Set(Object.keys(JSON.parse(readFileSync(join(CSS, "INDICE.json"), "utf8")).ficheros));
const FIDX = JSON.parse(readFileSync(join(FUENTES, "INDICE.json"), "utf8"));
const HOJAS_FUENTE = Object.entries(FIDX.ficheros).filter(([, v]) => v.tipo === "css").map(([k]) => k);

function monta(html) {
  let out = html.replace(/<link\b[^>]*>/gi, (tag) => {
    if (!/rel=["']?stylesheet/i.test(tag)) return tag;
    const href = (/href=["']([^"']+)["']/i.exec(tag) || [])[1];
    if (!href) return tag;
    const rel = href.replace(/^https?:\/\/kunakair\.com\//, "").split("?")[0];
    if (!LOCAL.has(rel)) return tag;
    return tag.replace(/href=["'][^"']+["']/i, `href="${pathToFileURL(join(CSS, rel)).href}"`);
  });
  const links = HOJAS_FUENTE.map((f) => `<link rel="stylesheet" href="${pathToFileURL(join(FUENTES, f)).href}">`).join("");
  return /<\/head>/i.test(out) ? out.replace(/<\/head>/i, `${links}</head>`) : links + out;
}

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new", args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars"],
});

const filas = [];
for (const pg of TODAS) {
  const f = join(CORPUS, pg.fichero);
  if (!existsSync(f)) continue;
  if (!/et_pb_toggle/.test(readFileSync(f, "utf8"))) continue;
  const page = await browser.newPage();
  if (ANCHO <= 500) {
    await page.setViewport({ width: ANCHO, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await page.setUserAgent("Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36");
  } else await page.setViewport({ width: ANCHO, height: 900, deviceScaleFactor: 1 });
  await page.setRequestInterception(true);
  page.on("request", (q) => (q.url().startsWith("file:") || q.url().startsWith("data:")) ? q.continue() : q.abort().catch(() => {}));
  await page.goto(pathToFileURL(f).href, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.setContent(monta(readFileSync(f, "utf8")), { waitUntil: "networkidle0", timeout: 120_000 });
  await new Promise((r) => setTimeout(r, 500));
  await page.evaluate(async () => { if (document.fonts?.ready) await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]); });
  const datos = await page.evaluate(() => {
    const n = (v) => +parseFloat(v || "0").toFixed(2);
    return [...document.querySelectorAll(".et_pb_toggle")].map((t) => {
      const cs = getComputedStyle(t);
      const tit = t.querySelector(".et_pb_toggle_title");
      const con = t.querySelector(".et_pb_toggle_content");
      const cst = tit && getComputedStyle(tit);
      const csc = con && getComputedStyle(con);
      const before = tit && getComputedStyle(tit, "::before");
      return {
        cerrado: t.classList.contains("et_pb_toggle_close"),
        h: n(t.getBoundingClientRect().height), w: n(t.getBoundingClientRect().width),
        caja: { pt: n(cs.paddingTop), pr: n(cs.paddingRight), pb: n(cs.paddingBottom), pl: n(cs.paddingLeft), mb: n(cs.marginBottom), borde: cs.borderTopWidth + " " + cs.borderTopStyle + " " + cs.borderTopColor, radio: cs.borderTopLeftRadius, bg: cs.backgroundColor },
        titulo: cst && { tag: tit.tagName.toLowerCase(), h: n(tit.getBoundingClientRect().height), fs: cst.fontSize, lh: cst.lineHeight, fw: cst.fontWeight, color: cst.color, pt: n(cst.paddingTop), pb: n(cst.paddingBottom), pr: n(cst.paddingRight), pl: n(cst.paddingLeft), m: `${n(cst.marginTop)}/${n(cst.marginBottom)}`, pos: cst.position, cursor: cst.cursor },
        icono: before && { content: before.content, ff: before.fontFamily, fs: before.fontSize, pos: before.position, right: before.right, top: before.top, color: before.color },
        contenido: csc && { display: csc.display, h: n(con.getBoundingClientRect().height), pt: n(csc.paddingTop), pb: n(csc.paddingBottom) },
      };
    });
  });
  await page.close();
  for (const d of datos) filas.push({ ruta: pg.ruta, ...d });
}
await browser.close();

const l = [];
l.push(`═══ toggle-f33 · la geometría del \`toggle\` CERRADO en el original · ancho ${ANCHO}\n`);
l.push(`  instancias ${filas.length} · cerradas ${filas.filter((f) => f.cerrado).length} · abiertas ${filas.filter((f) => !f.cerrado).length}`);
const alturas = {};
for (const f of filas) alturas[f.h] = (alturas[f.h] || 0) + 1;
l.push(`  alturas del módulo: ${Object.entries(alturas).map(([k, v]) => `${k} ×${v}`).join(" · ")}`);
const disp = {};
for (const f of filas) if (f.contenido) disp[f.contenido.display] = (disp[f.contenido.display] || 0) + 1;
l.push(`  \`display\` del CONTENIDO: ${Object.entries(disp).map(([k, v]) => `${k} ×${v}`).join(" · ")}`);
l.push("\n  la primera instancia, entera:");
l.push(JSON.stringify(filas[0], null, 2).split("\n").map((s) => "    " + s).join("\n"));
/**
 * ⚠⚠ **LA VARIANZA, ANTES DE ESCRIBIR NINGÚN VALOR.** Un número medido en una
 * instancia no es plantilla: es esa instancia. Y **varianza cero tampoco
 * prueba plantilla** (§test B, falso negativo: un campo que el editor puso
 * uniforme en toda la página no varía). Lo que esto compra es lo contrario: si
 * algo VARÍA, es campo con certeza y **no se cablea**.
 *
 * Las dos poblaciones se reportan POR SEPARADO porque son dos mecanismos: los
 * `display:none` son los `et_pb_toggle` del builder (los 10 que el censo
 * cuenta) y los `display:block` de `preguntas-frecuentes` son otra cosa.
 */
l.push("\n  ── VARIANZA por población (mecanismo = `display` del contenido) ──");
for (const [nombre, pobl] of [["display:none (los 10 del censo)", filas.filter((f) => f.contenido?.display === "none")],
  ["display:block (preguntas-frecuentes)", filas.filter((f) => f.contenido?.display === "block")]]) {
  l.push(`\n  ${nombre} · n = ${pobl.length}`);
  const ejes = {
    "caja.pt": (f) => f.caja.pt, "caja.pb": (f) => f.caja.pb, "caja.pl": (f) => f.caja.pl, "caja.pr": (f) => f.caja.pr,
    "caja.borde": (f) => f.caja.borde, "caja.radio": (f) => f.caja.radio, "caja.bg": (f) => f.caja.bg, "caja.mb": (f) => f.caja.mb,
    "tit.tag": (f) => f.titulo?.tag, "tit.fs": (f) => f.titulo?.fs, "tit.lh": (f) => f.titulo?.lh,
    "tit.fw": (f) => f.titulo?.fw, "tit.color": (f) => f.titulo?.color, "tit.pr": (f) => f.titulo?.pr,
    "icono.content": (f) => f.icono?.content, "icono.top": (f) => f.icono?.top, "icono.color": (f) => f.icono?.color,
    "cont.pt": (f) => f.contenido?.pt,
  };
  for (const [k, g] of Object.entries(ejes)) {
    const r = {};
    for (const f of pobl) { const v = String(g(f)); r[v] = (r[v] || 0) + 1; }
    const vals = Object.entries(r);
    l.push(`     ${k.padEnd(14)} ${vals.length === 1 ? "UNIFORME" : `⚠ VARÍA (${vals.length})`}  ${vals.map(([v, n]) => `${v} ×${n}`).join(" · ")}`);
  }
}

l.push("\n  todas, por ruta:");
for (const f of filas)
  l.push(`    ${f.ruta.padEnd(52)} h ${String(f.h).padStart(7)} · tit ${String(f.titulo?.h).padStart(6)} (${f.titulo?.tag} ${f.titulo?.fs}/${f.titulo?.lh}) · cont ${f.contenido?.display} ${f.contenido?.h}`);
const txt = l.join("\n") + "\n";
console.log(txt);
writeFileSync(join(AQUI, `toggle-f33-${ANCHO}.log`), txt);
