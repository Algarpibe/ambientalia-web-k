/**
 * C1 · LOCALIZACIÓN — dónde vive el desfase del cascarón fuera de sección.
 * Diagnóstico: no arregla nada. Una ruta por familia.
 *
 * El delta se calculó como docH − Σsecciones. Aquí se abre esa "resto" en sus
 * piezas reales, POR COMPOSICIÓN y al nivel donde vive cada una:
 *   · cabecera (y su alto, y si está en flujo)
 *   · lo que hay ENTRE el top del documento y la primera sección
 *   · cada hueco entre secciones consecutivas
 *   · el pie, y lo que va entre la última sección y el pie
 */
import { launch, openPage, settle, w } from "./lib.mjs";

const width = Number(process.argv[2] || 1440);
const mobile = width <= 500;
const CLON = process.env.CLON || "http://localhost:3000";

const PARES = [
  ["A · blog", "https://kunakair.com/es/todas-nuestras-soluciones-en-el-iotswc/", "/todas-nuestras-soluciones-en-el-iotswc"],
  ["CATÁLOGO", "https://kunakair.com/es/accesorios/", "/accesorios"],
  ["SOFTWARE", "https://kunakair.com/es/kunak-api/", "/kunak-api"],
];

const LECTOR = () => {
  const r = (n) => Math.round(n * 100) / 100;
  const Y = (el) => r(el.getBoundingClientRect().y + window.scrollY);
  const H = (el) => r(el.getBoundingClientRect().height);
  const t = (el, n = 30) => (el?.textContent || "").replace(/\s+/g, " ").trim().slice(0, n);

  const divi = [...document.querySelectorAll(".et_pb_section")];
  const esOriginal = divi.length > 0;
  const secs = esOriginal
    ? divi.filter((s) => !/_tb_(header|footer)\b/.test(s.className))
    : [...document.querySelectorAll("main > section")];

  // cabecera y pie, con el selector de cada lado
  const cab = document.querySelector(esOriginal ? "header.et-l--header, #main-header" : "header");
  const pie = document.querySelector(esOriginal ? "footer.et-l--footer, #main-footer" : "footer");

  const piezas = [];
  const push = (nombre, el) => {
    if (!el) return piezas.push({ nombre, ausente: true });
    const s = getComputedStyle(el);
    piezas.push({
      nombre,
      y: Y(el),
      h: H(el),
      position: s.position,
      enFlujo: s.position !== "absolute" && s.position !== "fixed",
      mt: s.marginTop,
      mb: s.marginBottom,
      pt: s.paddingTop,
      pb: s.paddingBottom,
      txt: t(el),
    });
  };
  push("cabecera", cab);
  push("pie", pie);

  const listaSecs = secs.map((s, i) => ({ i, y: Y(s), h: H(s), txt: t(s) }));
  const primera = listaSecs[0] || null;
  const ultima = listaSecs[listaSecs.length - 1] || null;

  // huecos entre secciones consecutivas
  const huecos = [];
  for (let i = 1; i < listaSecs.length; i++) {
    const a = listaSecs[i - 1], b = listaSecs[i];
    huecos.push({ entre: `${i - 1}→${i}`, hueco: r(b.y - (a.y + a.h)) });
  }

  const docH = r(document.documentElement.scrollHeight);
  return {
    docH,
    nSecs: listaSecs.length,
    secciones: listaSecs,
    piezas,
    huecos,
    // las tres zonas del "resto"
    antesDePrimeraSeccion: primera ? primera.y : null,
    entreUltimaSeccionYPie: pie && ultima ? r(Y(pie) - (ultima.y + ultima.h)) : null,
    altoPie: pie ? H(pie) : null,
    despuesDelPie: pie ? r(docH - (Y(pie) + H(pie))) : null,
    sumaSecciones: r(listaSecs.reduce((a, s) => a + s.h, 0)),
  };
};

const { browser } = await launch();
const salida = { meta: { width, fecha: new Date().toISOString().slice(0, 10) }, familias: {} };

for (const [fam, orig, clon] of PARES) {
  const lee = async (url) => {
    const { page, status } = await openPage(browser, url, { width, height: mobile ? 844 : 900, mobile });
    if (status !== 200) { await page.close(); throw new Error("HTTP " + status + " " + url); }
    await settle(page);
    const d = await page.evaluate(LECTOR);
    await page.close();
    return d;
  };
  const o = await lee(orig), c = await lee(CLON + clon);
  salida.familias[fam] = { orig: o, clon: c };

  const d = (a, b) => +(b - a).toFixed(2);
  console.log(`\n█ ${fam}  @${width}`);
  console.log(`   docH ${o.docH} → ${c.docH}   Δ ${d(o.docH, c.docH)}`);
  console.log(`   Σsecciones ${o.sumaSecciones} → ${c.sumaSecciones}   Δ ${d(o.sumaSecciones, c.sumaSecciones)}   (secs ${o.nSecs}→${c.nSecs})`);
  console.log(`   ── el RESTO, por composición:`);
  console.log(`      antes de la 1ª sección   ${String(o.antesDePrimeraSeccion).padStart(9)} → ${String(c.antesDePrimeraSeccion).padStart(9)}   Δ ${String(d(o.antesDePrimeraSeccion, c.antesDePrimeraSeccion)).padStart(9)}`);
  console.log(`      entre última sec. y pie  ${String(o.entreUltimaSeccionYPie).padStart(9)} → ${String(c.entreUltimaSeccionYPie).padStart(9)}   Δ ${String(d(o.entreUltimaSeccionYPie, c.entreUltimaSeccionYPie)).padStart(9)}`);
  console.log(`      ALTO DEL PIE             ${String(o.altoPie).padStart(9)} → ${String(c.altoPie).padStart(9)}   Δ ${String(d(o.altoPie, c.altoPie)).padStart(9)}`);
  console.log(`      después del pie          ${String(o.despuesDelPie).padStart(9)} → ${String(c.despuesDelPie).padStart(9)}   Δ ${String(d(o.despuesDelPie, c.despuesDelPie)).padStart(9)}`);
  const sumaHuecos = (x) => +x.huecos.reduce((a, h) => a + h.hueco, 0).toFixed(2);
  console.log(`      Σ huecos entre secciones ${String(sumaHuecos(o)).padStart(9)} → ${String(sumaHuecos(c)).padStart(9)}   Δ ${String(d(sumaHuecos(o), sumaHuecos(c))).padStart(9)}`);
  for (const p of ["cabecera", "pie"]) {
    const po = o.piezas.find((x) => x.nombre === p), pc = c.piezas.find((x) => x.nombre === p);
    console.log(`      · ${p}: orig h=${po?.h} pos=${po?.position} flujo=${po?.enFlujo}  |  clon h=${pc?.h} pos=${pc?.position} flujo=${pc?.enFlujo}`);
  }
}
await browser.close();
w(`medidas/c1-localizacion-${width}.json`, salida);
