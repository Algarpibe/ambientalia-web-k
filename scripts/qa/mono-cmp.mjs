/**
 * MONOGRÁFICO: original vs clon **módulo a módulo**, no fila a fila.
 * Uso: node mono-cmp.mjs <edar|petroleo> [ancho]   (con el clon servido)
 *
 * `tree-cmp.mjs` se para en la fila y dice *cuánto* falta; con ~60 módulos por
 * página eso no dice *dónde*. Y el total de una fila puede ser dos errores que
 * se anulan, que ya pasó una vez en este proyecto (el CTA de Industria: −47.5
 * de contenido tapados por +74 de ritmo).
 *
 * Compara, por columna y en orden: alto de cada módulo y su `margin-bottom`.
 * Así el informe separa **contenido** (el alto) de **ritmo** (el margen), que
 * son dos defectos distintos con dos arreglos distintos.
 */
import { launch, openPage, settle } from "./lib.mjs";

const URLS = {
  edar: [
    "https://kunakair.com/es/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar/",
    "http://localhost:3000/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar",
  ],
  petroleo: [
    "https://kunakair.com/es/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas/",
    "http://localhost:3000/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas",
  ],
};

const cual = process.argv[2] || "edar";
const width = Number(process.argv[3] || 1440);
const mobile = width <= 500;
const [ORIG, CLON] = URLS[cual];
const { browser } = await launch();

const extraer = function (esOriginal) {
  const r = (n) => Math.round(n * 100) / 100;
  const t = (el, n = 30) => (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, n);
  const sinEsp = (el) => (el.textContent || "").replace(/\s+/g, "");
  const px = (v) => Math.round(parseFloat(v) * 100) / 100;

  let secs, filaSel, colSel, modSel;
  if (esOriginal) {
    const todas = [...document.querySelectorAll(".et_pb_section")];
    const iMigas = todas.findIndex((s) => sinEsp(s).startsWith("InicioSectores"));
    const iSlider = todas.findIndex((s) => s.classList.contains("et_pb_fullwidth_section"));
    secs = todas.slice(iMigas + 2, iSlider);
    filaSel = ":scope > .et_pb_row";
    colSel = ":scope > .et_pb_column";
    modSel = ":scope > .et_pb_module";
  } else {
    const todas = [...document.querySelectorAll("main > section")];
    const iHero = todas.findIndex((s) => /pb-\[20px\]/.test(s.className));
    let iSlider = -1;
    todas.forEach((s, i) => {
      if (s.querySelector(".swiper")) iSlider = i;
    });
    secs = todas.slice(iHero + 1, iSlider > iHero ? iSlider : undefined);
    filaSel = ":scope > div";
    colSel = ":scope > div > div"; // fila → flex → columna
    modSel = ":scope > div";
  }

  return secs.map((sec, i) => ({
    i,
    h: r(sec.getBoundingClientRect().height),
    filas: [...sec.querySelectorAll(filaSel)].map((f, j) => ({
      j,
      h: r(f.getBoundingClientRect().height),
      cols: [...f.querySelectorAll(colSel)].map((c, k) => ({
        k,
        h: r(c.getBoundingClientRect().height),
        // a 390 las columnas apilan y llevan hueco entre ellas: es dato, no
        // regla — hay columnas no-últimas con `margin-bottom: 0`
        mb: px(getComputedStyle(c).marginBottom),
        mods: [...c.querySelectorAll(modSel)]
          // el punteado no cuenta: va fuera del flujo en los dos lados
          .filter((m) => !m.querySelector('img[src*="punteado"]') || m.children.length > 1)
          .map((m) => ({
            h: r(m.getBoundingClientRect().height),
            mb: px(getComputedStyle(m).marginBottom),
            pb: px(getComputedStyle(m).paddingBottom),
            txt: t(m),
          })),
      })),
    })),
  }));
};

async function medir(url, esOriginal) {
  const { page } = await openPage(browser, url, { width, height: mobile ? 844 : 900, mobile });
  await settle(page);
  const out = await page.evaluate(extraer, esOriginal);
  await page.close();
  return out;
}

const o = await medir(ORIG, true);
const c = await medir(CLON, false);
await browser.close();

const d = (a, b) => {
  const v = Math.round((b - a) * 100) / 100;
  return v === 0 ? "   ·  " : (v > 0 ? "+" : "") + v;
};

console.log(`\n════════ ${cual} @${width} · original → clon ════════`);
let malContenido = 0;
let malRitmo = 0;
/**
 * Secciones, filas y columnas que no cuadran.
 *
 * ⚠ Hace falta contarlas **aparte de los módulos**: la primera versión de esta
 * sonda solo contaba módulos y sacó un "✅ 0 módulos distintos" con la sección 0
 * de EDAR a −48. El desfase estaba en el `margin-bottom` de la `<table>`, que no
 * es de ningún módulo. Una sonda que no mira un nivel del árbol da el mismo
 * "limpio" que una que no encuentra nada.
 */
let malEstructura = 0;

for (let i = 0; i < Math.max(o.length, c.length); i++) {
  const so = o[i];
  const sc = c[i];
  if (!so || !sc) {
    console.log(`SEC ${i}  ${so ? "FALTA en clon" : "SOBRA en clon"}`);
    continue;
  }
  if (so.h !== sc.h) malEstructura++;
  console.log(`\nSEC ${i}   h ${so.h} → ${sc.h}   Δ${d(so.h, sc.h)}`);
  for (let j = 0; j < Math.max(so.filas.length, sc.filas.length); j++) {
    const fo = so.filas[j];
    const fc = sc.filas[j];
    if (!fo || !fc) {
      console.log(`  F${j}  ${fo ? "FALTA en clon" : "SOBRA en clon"}`);
      continue;
    }
    if (fo.h !== fc.h) malEstructura++;
    console.log(`  F${j}  h ${fo.h} → ${fc.h}   Δ${d(fo.h, fc.h)}`);
    for (let k = 0; k < Math.max(fo.cols.length, fc.cols.length); k++) {
      const co = fo.cols[k];
      const cc = fc.cols[k];
      if (!co || !cc) {
        console.log(`    C${k}  ${co ? "FALTA en clon" : "SOBRA en clon"}`);
        continue;
      }
      const dif = co.h !== cc.h;
      // el hueco entre columnas apiladas a 390 no es de ningún módulo
      if (co.mb !== cc.mb) malEstructura++;
      console.log(
        `    C${k}  h ${co.h} → ${cc.h}   Δ${d(co.h, cc.h)}` +
          (co.mb !== cc.mb ? `   ❌ mb ${co.mb} → ${cc.mb}` : "") +
          (dif ? "" : "  ok"),
      );
      if (!dif) continue;
      for (let l = 0; l < Math.max(co.mods.length, cc.mods.length); l++) {
        const mo = co.mods[l];
        const mc = cc.mods[l];
        if (!mo || !mc) {
          console.log(`      M${l}  ${mo ? "FALTA en clon" : "SOBRA en clon"}  "${(mo || mc).txt}"`);
          continue;
        }
        const dh = Math.round((mc.h - mo.h) * 100) / 100;
        const dm = Math.round((mc.mb - mo.mb) * 100) / 100;
        if (dh) malContenido++;
        if (dm) malRitmo++;
        console.log(
          `      M${l}  alto ${String(mo.h).padStart(8)} → ${String(mc.h).padStart(8)} Δ${d(mo.h, mc.h).padEnd(8)}` +
            ` mb ${String(mo.mb).padStart(8)} → ${String(mc.mb).padStart(8)} Δ${d(mo.mb, mc.mb).padEnd(8)}  "${mo.txt}"`,
        );
      }
    }
  }
}

const total = malContenido + malRitmo + malEstructura;
console.log(
  `\n${total === 0 ? "✅" : "❌"} módulos con el ALTO distinto: ${malContenido}` +
    `  ·  con el MARGEN distinto: ${malRitmo}` +
    `  ·  secciones/filas/columnas que no cuadran: ${malEstructura}`,
);
console.log("   (el alto es contenido; el margen es ritmo — son dos defectos distintos,");
console.log("    y lo que no cae en ningún módulo se cuenta como estructura)");
process.exit(total === 0 ? 0 : 1);
