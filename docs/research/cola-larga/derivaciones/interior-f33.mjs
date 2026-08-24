/**
 * ¿LOS ENVOLTORIOS INTERIORES DEL MÓDULO LLEVAN GEOMETRÍA? — derivación de la 102.ª.
 * Uso: node docs/research/cola-larga/derivaciones/interior-f33.mjs
 *
 * §F3-3-MARCADO-INTERIOR (101.ª) nombró **siete huecos de forma**: el clon no
 * emite `et_pb_text_inner` (151/151), `et_pb_image_wrap` (53/71),
 * `et_pb_blurb_content` (22/22), `et_pb_code_inner` (9/9), ni el doble span del
 * `icon`. Lo que NO dijo —porque el cotejo era de MARCADO— es **si esos nodos
 * llevan ritmo o caja**, que es lo único que decide si el clon los necesita.
 *
 * En KB la pregunta equivalente se contestó CON medida (*«ritmo 0 en los 85»*) y
 * por eso `CuerpoKb` pudo omitirlos. Aquí esa medida no existía, así que la
 * decisión de la hoja se estaba tomando a ciegas en las dos direcciones:
 * omitirlos sin medir es tan arbitrario como emitirlos sin medir.
 *
 * Esto los mide sobre el corpus CON SUS HOJAS y publica, por clase de
 * envoltorio, su ritmo y su caja con el cardinal. **No decide el modelo:
 * describe.** Quien decide es quien escriba la hoja, con esto delante.
 *
 * ⚠ Móvil por `Emulation.setDeviceMetricsOverride`, nunca por
 * `setViewport({isMobile})`: eso recarga y se lleva las hojas ENLAZADAS
 * (derivación hermana `movil-recarga-hojas.mjs`, 6 de 6 rutas afectadas).
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

const conHojas = (html) => {
  let enlazadas = 0;
  let resueltas = 0;
  const out = html.replace(/<link\b[^>]*>/gi, (tag) => {
    if (!/rel=["']?stylesheet/i.test(tag)) return tag;
    enlazadas++;
    const href = (/href=["']([^"']+)["']/i.exec(tag) || [])[1];
    if (!href) return tag;
    const rel = href.replace(/^https?:\/\/kunakair\.com\//, "").split("?")[0];
    if (!LOCAL.has(rel)) return tag;
    resueltas++;
    return tag.replace(/href=["'][^"']+["']/i, `href="${pathToFileURL(join(CSS, rel)).href}"`);
  });
  return { html: out, enlazadas, resueltas };
};

/** Dentro de la página: el PRIMER hijo de cada módulo de la capa propia. */
function medirInterior() {
  const num = (v) => {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? Math.round(n * 100) / 100 : v;
  };
  const propia = (el) => ![...el.classList].some((c) => c.includes("_tb_"));
  const idDe = (el) => {
    for (const c of el.classList) {
      const m = /^et_pb_([a-z][a-z0-9_]*?)_(\d+)$/.exec(c);
      if (m && !c.includes("_tb_")) return { tipo: m[1], id: c };
    }
    return null;
  };
  const esEstructura = (t) => /^(section|row|row_inner|column(_\d+)?|column_inner(_\d+)?)$/.test(t);

  const fuera = [];
  for (const col of document.querySelectorAll('.et_pb_row [class*="et_pb_column"], .et_pb_row_inner [class*="et_pb_column"]')) {
    if (!propia(col)) continue;
    const baja = (n) => {
      for (const h of n.children) {
        const d = idDe(h);
        if (d && !esEstructura(d.tipo)) {
          /* El primer hijo ELEMENTO del módulo, que es el envoltorio interior. */
          const hijo = h.firstElementChild;
          if (!hijo) {
            fuera.push({ tipo: d.tipo, clase: "(sin hijo elemento)", conCaja: false });
            continue;
          }
          const r = hijo.getBoundingClientRect();
          const cs = getComputedStyle(hijo);
          fuera.push({
            tipo: d.tipo,
            etiqueta: hijo.tagName.toLowerCase(),
            clase: [...hijo.classList].filter((c) => !/^et_pb_[a-z_]*_\d+$/.test(c)).join(".") || "(sin clase)",
            conCaja: r.width > 0,
            mt: num(cs.marginTop),
            mb: num(cs.marginBottom),
            ml: num(cs.marginLeft),
            mr: num(cs.marginRight),
            pt: num(cs.paddingTop),
            pb: num(cs.paddingBottom),
            pl: num(cs.paddingLeft),
            pr: num(cs.paddingRight),
            display: cs.display,
            maxWidth: cs.maxWidth,
            w: num(r.width),
            wPadre: num(h.getBoundingClientRect().width),
          });
          continue;
        }
        baja(h);
      }
    };
    baja(col);
  }
  return fuera;
}

const { browser } = await launch();
const page = await browser.newPage();
await page.setRequestInterception(true);
page.on("request", (r) => (r.url().startsWith("file://") || r.url() === "about:blank" ? r.continue() : r.abort()));
const client = await page.createCDPSession();

const todos = [];
let hojasMal = 0;
for (const { ruta } of F33) {
  const pg = porRuta.get(ruta);
  if (!pg) continue;
  const { html, enlazadas, resueltas } = conHojas(readFileSync(join(CORPUS, pg.fichero), "utf8"));
  if (enlazadas && !resueltas) hojasMal++;
  await client.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await page.goto(pathToFileURL(join(CORPUS, pg.fichero)).href, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.setContent(html, { waitUntil: "networkidle0", timeout: 120_000 });
  await page.evaluate(async () => {
    for (const img of document.querySelectorAll("img")) {
      img.loading = "eager";
      img.decoding = "sync";
    }
    await Promise.race([
      Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => (i.onload = i.onerror = r)))),
      new Promise((r) => setTimeout(r, 2000)),
    ]);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
  for (const x of await page.evaluate(medirInterior)) todos.push({ ruta, ...x });
}
await browser.close();

/* ── El informe, agrupado por (tipo, clase del envoltorio) ─────────────────── */
const grupos = new Map();
for (const x of todos) {
  const k = `${x.tipo}  →  ${x.etiqueta ?? "?"}.${x.clase}`;
  const g = grupos.get(k) ?? { n: 0, sinCaja: 0, ritmo: new Map(), display: new Map(), maxWidth: new Map(), razonW: new Set() };
  g.n++;
  if (!x.conCaja) {
    g.sinCaja++;
    grupos.set(k, g);
    continue;
  }
  const r = `mt${x.mt} mb${x.mb} ml${x.ml} mr${x.mr} · pt${x.pt} pb${x.pb} pl${x.pl} pr${x.pr}`;
  g.ritmo.set(r, (g.ritmo.get(r) ?? 0) + 1);
  g.display.set(x.display, (g.display.get(x.display) ?? 0) + 1);
  g.maxWidth.set(x.maxWidth, (g.maxWidth.get(x.maxWidth) ?? 0) + 1);
  if (x.wPadre) g.razonW.add(Math.round((x.w / x.wPadre) * 1000) / 10);
  grupos.set(k, g);
}

console.log(`derivación: ¿los envoltorios INTERIORES del módulo llevan geometría?`);
console.log(`fuente    : corpus/fase-3 + corpus/css · ${F33.length} rutas · 1440 · páginas con hojas sin resolver: ${hojasMal}`);
console.log(`total     : ${todos.length} primeros-hijos de módulo\n`);

const NULO = (r) => /^mt0 mb0 ml0 mr0 · pt0 pb0 pl0 pr0$/.test(r);
let conRitmo = 0;
let sinRitmo = 0;
for (const [k, g] of [...grupos].sort((a, b) => b[1].n - a[1].n)) {
  const rs = [...g.ritmo.entries()].sort((a, b) => b[1] - a[1]);
  const todoNulo = rs.length > 0 && rs.every(([r]) => NULO(r));
  if (rs.length) (todoNulo ? (sinRitmo += g.n) : (conRitmo += g.n));
  console.log(`  ${todoNulo ? "·" : "⚠"} ${k.padEnd(46)} n=${String(g.n).padStart(3)}${g.sinCaja ? ` (sin caja ${g.sinCaja})` : ""}`);
  for (const [r, c] of rs.slice(0, 3)) console.log(`      ritmo  ${r}  ×${c}`);
  if (g.display.size) console.log(`      display ${JSON.stringify(Object.fromEntries(g.display))} · max-width ${JSON.stringify(Object.fromEntries(g.maxWidth))} · ancho ${[...g.razonW].join(" · ")} % del módulo`);
}

console.log(
  `\n  ── LECTURA ──\n` +
    `  envoltorios con ritmo NULO en los cuatro lados : ${sinRitmo}\n` +
    `  envoltorios que SÍ llevan ritmo                : ${conRitmo}\n\n` +
    `  Un envoltorio de ritmo nulo, display block y ancho 100 % del módulo NO aporta\n` +
    `  geometría: el clon puede omitirlo y la hoja no lo necesita. Uno que lleve ritmo,\n` +
    `  o que no ocupe el 100 %, SÍ — y entonces la decisión es del COMPONENTE, no de la hoja.\n`,
);
