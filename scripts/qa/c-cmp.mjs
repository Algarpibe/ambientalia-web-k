/**
 * ORIGINAL vs CLON para las 6 rutas nuevas del grupo C, y las tres predicciones
 * que solo se pueden cobrar con las rutas ya emitidas.
 * Uso: npm run qa:c-cmp -- [ancho]      (necesita el clon servido en :3000)
 *
 *   P-C3-3 · el cuerpo entra con §3.1 + nodo de vídeo + nodo-embed, sin
 *            construcción nueva. Se inventaría lo que el cuerpo REALMENTE trae
 *            en las 6, y se compara contra los cauces abiertos.
 *   P-C3-6 · el mapa: contenedor **330 a 1440 / 290 a 390**, **un** marcador.
 *   P-C3-7 · la FAQ entra con `titulo + cuerpo` y **no aparece ningún campo**:
 *            se comprueba que su cuerpo no trae ninguna de las piezas del caso.
 *
 * ── La base de lectura es el `h1` ──────────────────────────────────────────
 * Protocolo del README §2: se compara el `h1` **antes que nada** y, si difiere,
 * ese desplazamiento se resta de todo lo demás. Si no, un solo defecto de
 * cabecera se lee como veinte.
 *
 * ── Un canal de verdad ─────────────────────────────────────────────────────
 * Lo que imprime y lo que cuenta no discrepan: **cada predicción cierra el
 * código de salida**, y el Δ de alturas se informa aparte porque el original es
 * un sitio vivo y su suelo de ruido no es cero en todas las regiones.
 */
import { launch, openPage, settle, w } from "./lib.mjs";

const width = Number(process.argv[2] || 1440);
const mobile = width <= 500;
const CLON = process.env.CLON || "http://localhost:3000";

const RUTAS = [
  { clave: "des-moines", clon: "/casos-de-exito/control-de-la-contaminacion-por-malos-olores-en-des-moines-iowa",
    orig: "https://kunakair.com/es/casos-de-exito/control-de-la-contaminacion-por-malos-olores-en-des-moines-iowa/", forma: "caso" },
  { clave: "world-athletics", clon: "/casos-de-exito/red-calidad-de-aire-para-world-athletics",
    orig: "https://kunakair.com/es/casos-de-exito/red-calidad-de-aire-para-world-athletics/", forma: "caso" },
  { clave: "rio-de-janeiro", clon: "/case-studies/distrito-baja-emision-rio-de-janeiro",
    orig: "https://kunakair.com/es/case-studies/distrito-baja-emision-rio-de-janeiro/", forma: "caso" },
  { clave: "lindano", clon: "/casos-de-exito/sistema-de-alerta-de-contaminacion-de-acuifero-por-lindano",
    orig: "https://kunakair.com/es/casos-de-exito/sistema-de-alerta-de-contaminacion-de-acuifero-por-lindano/", forma: "caso" },
  { clave: "faq-dron", clon: "/faqs/puedo-instalarlo-en-un-vehiculo-o-en-un-dron-para-monitoreo-en-movimiento",
    orig: "https://kunakair.com/es/faqs/puedo-instalarlo-en-un-vehiculo-o-en-un-dron-para-monitoreo-en-movimiento/", forma: "faq" },
  { clave: "faq-calibracion", clon: "/faqs/cual-es-la-diferencia-entre-calibracion-y-correccion",
    orig: "https://kunakair.com/es/faqs/cual-es-la-diferencia-entre-calibracion-y-correccion/", forma: "faq" },
];

/** Lo que se lee de cada página, sea original o clon. */
const LECTOR = () => {
  const r = (n) => Math.round(n * 100) / 100;
  const q = (s) => document.querySelector(s);
  const caja = (el) => (el ? { w: r(el.getBoundingClientRect().width), h: r(el.getBoundingClientRect().height) } : null);
  const y = (el) => (el ? r(el.getBoundingClientRect().y + window.scrollY) : null);
  const zonas = ".entry-content-need, .entry-content-solution, .entry-content-results, .entry-content";
  const etiquetas = {};
  for (const z of document.querySelectorAll(zonas))
    for (const el of z.querySelectorAll("*")) {
      const t = el.tagName.toLowerCase();
      etiquetas[t] = (etiquetas[t] || 0) + 1;
    }
  return {
    h1y: y(q("h1")),
    h1: caja(q("h1")),
    // P-C3-6 — el ALTO sí se mide en el DOM asentado (es layout). El número de
    // marcadores NO: ver `marcadoresServidos` abajo.
    mapa: caja(q(".acf-map")),
    // P-C3-3 / P-C3-7 — el inventario del cuerpo
    etiquetas,
    iframes: [...document.querySelectorAll(zonas + " iframe")].map((f) => {
      try { return new URL(f.getAttribute("src"), location.href).host; } catch { return "?"; }
    }),
    // piezas del CASO, para P-C3-7: en la FAQ tienen que ser 0 en los dos lados
    piezasDeCaso: {
      sobretitulo: document.querySelectorAll("p.sobretitulo, .sobretitulo").length,
      cliente: document.querySelectorAll(".case-cliente").length,
      chip: document.querySelectorAll(".case-sectores").length,
      detalles: document.querySelectorAll(".case-detalles").length,
      soluciones: document.querySelectorAll(".case-soluciones").length,
      galeria: document.querySelectorAll(".case-galeria").length,
      migas: document.querySelectorAll("ol.kunak-breadcrumbs").length,
    },
    docH: r(document.documentElement.scrollHeight),
  };
};

const { browser } = await launch();
const salida = { meta: { width, fecha: new Date().toISOString().slice(0, 10) }, paginas: {} };

for (const R of RUTAS) {
  const lee = async (url) => {
    const { page } = await openPage(browser, url, { width, height: mobile ? 844 : 900, mobile });
    await settle(page);
    const d = await page.evaluate(LECTOR);
    await page.close();
    return d;
  };
  /**
   * ⚠ El nº de marcadores se cuenta en el **HTML SERVIDO**, no en el DOM
   * asentado. En el original, el JS de Google Maps **consume los `.marker`** al
   * inicializar el mapa, así que tras `settle()` salen **0** aunque el HTML
   * traiga 1. La primera versión los contaba en el DOM y dio «original 0 / clon
   * 1» en las tres: un informe plausible que decía justo lo contrario de la
   * verdad. Es la regla del NIVEL aplicada al TIEMPO — la propiedad vive en el
   * HTML servido, y ahí es donde se mide.
   */
  const servidos = async (url) => {
    const html = await (await fetch(url)).text();
    return (html.match(/class="marker"/g) || []).length;
  };
  salida.paginas[R.clave] = {
    forma: R.forma,
    orig: await lee(R.orig), clon: await lee(CLON + R.clon),
    marcadoresServidos: { orig: await servidos(R.orig), clon: await servidos(CLON + R.clon) },
  };
  console.log(`  ✓ ${R.clave}`);
}
await browser.close();

/* ───────────────────────── los veredictos ───────────────────────── */

let fallos = 0;
const casos = Object.entries(salida.paginas).filter(([, v]) => v.forma === "caso");
const faqs = Object.entries(salida.paginas).filter(([, v]) => v.forma === "faq");

/* P-C3-6 · el mapa */
console.log(`\n═══ P-C3-6 · el mapa a ${width}`);
const ALTO = width <= 500 ? 290 : 330;
let malMapa = 0;
for (const [k, v] of casos) {
  const m = v.marcadoresServidos;
  if (!v.orig.mapa) {
    console.log(`  · ${k}: el ORIGINAL no lleva mapa — clon ${v.clon.mapa ? "SÍ (❌)" : "tampoco (✅)"}`);
    if (v.clon.mapa) malMapa++;
    continue;
  }
  const okAlto = v.clon.mapa?.h === ALTO && v.orig.mapa.h === ALTO;
  const okMarc = m.orig === 1 && m.clon === 1;
  if (!okAlto || !okMarc) malMapa++;
  console.log(`  ${okAlto && okMarc ? "✅" : "❌"} ${k.padEnd(16)} alto orig ${v.orig.mapa.h} · clon ${v.clon.mapa?.h ?? "—"} (esperado ${ALTO}) · marcadores servidos ${m.orig}/${m.clon}`);
}
fallos += malMapa;
console.log(`  ${malMapa === 0 ? "✅ P-C3-6 SE SOSTIENE" : "❌ P-C3-6 REFUTADA"} · ${malMapa} discrepancias`);

/* P-C3-3 · el contrato del cuerpo */
console.log(`\n═══ P-C3-3 · el cuerpo, contra los cauces abiertos`);
// §3.1 + los cauces que el esquema ya abrió. Todo lo que salga de aquí es
// «construcción nueva» y refuta.
const CAUCES = new Set(["p", "a", "strong", "b", "em", "i", "u", "sub", "sup", "br", "span", "div",
  "ul", "ol", "li", "h2", "h3", "h4", "img", "figure", "figcaption", "blockquote", "hr", "small", "mark",
  "iframe", "video", "source", "table", "thead", "tbody", "tfoot", "tr", "th", "td"]);
const fuera = {};
const tablas = [];
for (const [k, v] of Object.entries(salida.paginas)) {
  for (const [t, n] of Object.entries(v.orig.etiquetas)) if (!CAUCES.has(t)) (fuera[t] ??= []).push(`${k}×${n}`);
  if (v.orig.etiquetas.table) tablas.push(k);
}
const hosts = {};
for (const v of Object.values(salida.paginas)) for (const h of v.orig.iframes) hosts[h] = (hosts[h] || 0) + 1;
console.log(`  · tablas en el original: ${tablas.length ? tablas.join(" · ") : "ninguna"} (§3.4 sigue abierta)`);
console.log(`  · hosts de iframe: ${Object.entries(hosts).map(([h, n]) => `${h}×${n}`).join(" · ") || "ninguno"}`);
if (Object.keys(fuera).length) {
  fallos++;
  console.log(`  ❌ P-C3-3 REFUTADA · etiquetas FUERA de los cauces abiertos:`);
  for (const [t, d] of Object.entries(fuera)) console.log(`       <${t}>  ${d.join(" ")}`);
} else {
  console.log(`  ✅ P-C3-3 SE SOSTIENE · ninguna construcción fuera de §3.1 + vídeo + embed + tabla`);
}

/* P-C3-7 · la FAQ no crece */
console.log(`\n═══ P-C3-7 · la FAQ no estrena campos`);
let malFaq = 0;
for (const [k, v] of faqs) {
  const dif = Object.entries(v.orig.piezasDeCaso).filter(([p, n]) => n !== v.clon.piezasDeCaso[p]);
  const conCampo = Object.entries(v.orig.piezasDeCaso).filter(([, n]) => n > 0);
  if (dif.length || conCampo.length) malFaq++;
  console.log(`  ${dif.length || conCampo.length ? "❌" : "✅"} ${k.padEnd(16)} piezas de caso en el original: ${conCampo.length ? conCampo.map(([p, n]) => `${p}=${n}`).join(" ") : "NINGUNA"}${dif.length ? ` · difieren: ${dif.map(([p]) => p).join(" ")}` : ""}`);
}
fallos += malFaq;
console.log(`  ${malFaq === 0 ? "✅ P-C3-7 SE SOSTIENE" : "❌ P-C3-7 REFUTADA"} · la FAQ entra con \`titulo + cuerpo\``);

/* Δ de alturas — se INFORMA, no cierra el código: el original es un sitio vivo
 * y esto es la primera corrida de QA visual, no su cierre. */
console.log(`\n─── Δ de alturas @${width} (informativo — QA visual pendiente)`);
for (const [k, v] of Object.entries(salida.paginas)) {
  const base = +(v.clon.h1y - v.orig.h1y).toFixed(2);
  console.log(`  ${k.padEnd(16)} h1.y orig ${String(v.orig.h1y).padStart(7)} · clon ${String(v.clon.h1y).padStart(7)} · base ${base > 0 ? "+" : ""}${base}` +
    `   docH ${String(v.orig.docH).padStart(6)} → ${String(v.clon.docH).padStart(6)}  Δ${(v.clon.docH - v.orig.docH > 0 ? "+" : "")}${+(v.clon.docH - v.orig.docH).toFixed(2)}`);
}

w(`medidas/c-cmp-${width}.json`, salida);
console.log(`\n${fallos === 0 ? "✅ las tres predicciones SE SOSTIENEN" : `❌ ${fallos} discrepancias`} @${width}`);
process.exit(fallos === 0 ? 0 : 1);
