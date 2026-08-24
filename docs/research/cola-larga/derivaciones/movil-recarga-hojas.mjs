/**
 * ¿EL CAMINO DE MÓVIL SE LLEVA LAS HOJAS ENLAZADAS? — derivación de la 102.ª.
 * Uso: node docs/research/cola-larga/derivaciones/movil-recarga-hojas.mjs
 *
 * `CLAUDE.md` §Notas de método manda medir móvil **sólo** con
 * `Emulation.setDeviceMetricsOverride`. `qa:f33-geo` usa `page.setViewport({
 * isMobile: true })`, que por dentro **RECARGA la página** cuando cambia
 * `isMobile`/`hasTouch`.
 *
 * Sobre un documento montado con `setContent`, esa recarga vuelve al fichero
 * CRUDO del corpus — y con él a los `<link>` que apuntan a `kunakair.com`, que
 * la intercepción aborta. Quedan las hojas EN LÍNEA, que son la mayoría de las
 * reglas, así que **la medida no falla: sale PLAUSIBLE**.
 *
 * Esto mide los dos caminos sobre las MISMAS páginas y publica la diferencia.
 * No decide nada del clon: describe el instrumento.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { launch } from "../../../../scripts/qa/lib.mjs";

process.env.SIN_CLON = "1";
const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..", "..", "..");
const CORPUS = join(RAIZ, "corpus/fase-3");
const CSS = join(RAIZ, "corpus/css");

const LD = JSON.parse(readFileSync(join(CORPUS, "LISTA-DERIVADA.json"), "utf8")).trabajo;
const F33 = JSON.parse(readFileSync(join(RAIZ, "scripts/qa/medidas/f33-rutas.json"), "utf8")).paginas;
const LOCAL = new Set(Object.keys(JSON.parse(readFileSync(join(CSS, "INDICE.json"), "utf8")).ficheros));
const porRuta = new Map(LD.filter((e) => e.fichero).map((e) => [e.ruta, e]));

const conHojas = (html) =>
  html.replace(/<link\b[^>]*>/gi, (tag) => {
    if (!/rel=["']?stylesheet/i.test(tag)) return tag;
    const href = (/href=["']([^"']+)["']/i.exec(tag) || [])[1];
    if (!href) return tag;
    const rel = href.replace(/^https?:\/\/kunakair\.com\//, "").split("?")[0];
    return LOCAL.has(rel) ? tag.replace(/href=["'][^"']+["']/i, `href="${pathToFileURL(join(CSS, rel)).href}"`) : tag;
  });

/** Los mismos ejes a 390 por los dos caminos. */
async function medir390(via, rutas) {
  const { browser } = await launch();
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (r) => (r.url().startsWith("file://") || r.url() === "about:blank" ? r.continue() : r.abort()));
  const out = {};
  for (const ruta of rutas) {
    const pg = porRuta.get(ruta);
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(join(CORPUS, pg.fichero)).href, { waitUntil: "domcontentloaded" });
    await page.setContent(conHojas(readFileSync(join(CORPUS, pg.fichero), "utf8")), { waitUntil: "networkidle0" });
    if (via === "setViewport") {
      await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    } else {
      const c = await page.createCDPSession();
      await c.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    }
    await page.evaluate(() => new Promise((r) => setTimeout(r, 300)));
    out[ruta] = await page.evaluate(() => {
      const fila = document.querySelector(".et_pb_row:not([class*=_tb_])");
      const cs = fila ? getComputedStyle(fila) : null;
      return {
        hojas: document.styleSheets.length,
        enlaceLocal: !!document.querySelector("link[href^='file:']"),
        filaW: cs?.width ?? null,
        filaWDeclarada: cs?.width ?? null,
      };
    });
  }
  await browser.close();
  return out;
}

const RUTAS = F33.slice(0, 8).map((r) => r.ruta);
const A = await medir390("setViewport", RUTAS);
const B = await medir390("deviceMetricsOverride", RUTAS);

console.log(`derivación: ¿el camino de móvil se lleva las hojas ENLAZADAS?`);
console.log(`fuente    : corpus/fase-3 + corpus/css · ${RUTAS.length} rutas · 390×844\n`);
console.log(`  ${"ruta".padEnd(46)} | setViewport(isMobile)        | deviceMetricsOverride`);
console.log(`  ${"-".repeat(46)}-+------------------------------+------------------------------`);
let dif = 0;
for (const k of RUTAS) {
  const a = A[k];
  const b = B[k];
  const f = (x) => `hojas ${String(x.hojas).padStart(2)} · <link file:> ${x.enlaceLocal ? "sí" : "NO"} · fila ${String(x.filaW).padStart(9)}`;
  const igual = a.filaW === b.filaW && a.hojas === b.hojas;
  if (!igual) dif++;
  console.log(`  ${igual ? " " : "≠"} ${k.padEnd(44).slice(0, 44)} | ${f(a)} | ${f(b)}`);
}
console.log(`\n  ${dif} de ${RUTAS.length} rutas DIFIEREN entre los dos caminos.`);
console.log(
  `\n  Lectura: con la recarga desaparecen los <link> reescritos a file:// y con ellos\n` +
    `  \`KunakAir/style.css\`, que es quien sirve \`.et_pb_row { width: 86% }\`. Sin ella gana\n` +
    `  el \`80%\` de Divi. 86 % de 390 = 335.4 · 80 % de 390 = 312.\n`,
);
