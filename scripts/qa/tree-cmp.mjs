/**
 * S7 (2/2) — árbol de secciones/filas del CUERPO, original vs clon, lado a lado.
 * Uso: node tree-cmp.mjs <urbano|industria> [ancho]
 *
 * En el original el cuerpo son las `.et_pb_section` entre el hero (pb 60) y el
 * slider fullwidth. En el clon son las `<section>` de `main` entre la del hero
 * (la que lleva pb 60 / pb 20) y la del slider.
 */
import { launch, openPage, settle } from "./lib.mjs";

const URLS = {
  urbano: [
    "https://kunakair.com/es/sectores/calidad-del-aire-en-las-ciudades/",
    "http://localhost:3000/sectores/calidad-del-aire-en-las-ciudades",
  ],
  industria: [
    "https://kunakair.com/es/sectores/control-de-emisiones-industriales/",
    "http://localhost:3000/sectores/control-de-emisiones-industriales",
  ],
};

const cual = process.argv[2] || "industria";
const width = Number(process.argv[3] || 1440);
const mobile = width <= 500;
const [ORIG, CLON] = URLS[cual];
const { browser } = await launch();

// ojo: se serializa al navegador, así que el flag va por ARGUMENTO, no por
// closure (un `const` de fuera no viaja: ReferenceError en la página).
const extraer = function (esOriginal) {
    const r = (n) => Math.round(n * 100) / 100;
    const t = (el) => (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40);
    const geo = (el) => {
      const b = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        top: r(b.top + scrollY),
        h: r(b.height),
        mt: s.marginTop,
        pt: s.paddingTop,
        pb: s.paddingBottom,
      };
    };

    let secs, filaSel;
    if (esOriginal) {
      secs = [...document.querySelectorAll(".et_pb_section")];
      const iHero = secs.findIndex((s) => getComputedStyle(s).paddingBottom === "60px");
      const iSlider = secs.findIndex((s) => s.classList.contains("et_pb_fullwidth_section"));
      secs = secs.slice(iHero + 1, iSlider);
      filaSel = ":scope > .et_pb_row";
    } else {
      const todas = [...document.querySelectorAll("main > section")];
      // la del hero es la única con dos botones azules y pb 60/20
      const iHero = todas.findIndex((s) => /pb-\[60px\]|pb-\[20px\]/.test(s.className));
      secs = todas.slice(iHero + 1);
      filaSel = ":scope > div";
    }

    return secs.map((sec) => ({
      ...geo(sec),
      filas: [...sec.querySelectorAll(filaSel)].map((f) => ({ ...geo(f), txt: t(f) })),
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

const pinta = (etiqueta, secs) => {
  console.log(`\n--- ${etiqueta} ---`);
  secs.forEach((s, i) => {
    console.log(
      `SEC ${i}  top ${String(s.top).padStart(8)}  h ${String(s.h).padStart(8)}  mt ${s.mt.padStart(7)}  pt ${s.pt.padStart(9)}  pb ${s.pb.padStart(7)}`,
    );
    s.filas.forEach((f, j) =>
      console.log(
        `   fila ${j}  top ${String(f.top).padStart(8)}  h ${String(f.h).padStart(8)}  pt ${f.pt.padStart(9)}  pb ${f.pb.padStart(9)} | ${f.txt}`,
      ),
    );
  });
};

console.log(`\n======== ${cual} @${width} ========`);
pinta("ORIGINAL", o);
pinta("CLON", c);

// diff plano de filas, en orden
const plano = (secs) => secs.flatMap((s) => s.filas);
const fo = plano(o),
  fc = plano(c);
console.log(`\n--- filas en orden (Δ top / Δ h) ---`);
for (let i = 0; i < Math.max(fo.length, fc.length); i++) {
  const a = fo[i],
    b = fc[i];
  if (!a || !b) {
    console.log(`fila ${i}  ${!a ? "SOBRA en clon" : "FALTA en clon"}  | ${(a || b).txt}`);
    continue;
  }
  const dt = Math.round((b.top - a.top) * 10) / 10;
  const dh = Math.round((b.h - a.h) * 10) / 10;
  console.log(
    `fila ${i}  top ${String(a.top).padStart(8)} → ${String(b.top).padStart(8)}  Δ${(dt >= 0 ? "+" : "") + dt}`.padEnd(52) +
      `h ${String(a.h).padStart(8)} → ${String(b.h).padStart(8)}  Δ${(dh >= 0 ? "+" : "") + dh}  | ${a.txt}`,
  );
}

await browser.close();
