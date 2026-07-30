/**
 * S7 (2/2) — árbol de secciones/filas del CUERPO, original vs clon, lado a lado.
 * Uso: node tree-cmp.mjs <urbano|industria|construccion|investigacion|edar|petroleo> [ancho]
 *
 * El cuerpo es lo que va **entre el hero y el slider de ancho completo**, en los
 * dos lados.
 *
 * ⚠ **El hero NO se localiza por su `padding-bottom`.** Se localizaba por
 * `pb === 60px`, y eso dejó de valer al entrar el arquetipo MONOGRÁFICO, cuyo
 * hero cierra a **39** en desktop (y a 20 en móvil, como todos). Ahora se
 * localiza por la sección del breadcrumb, que es estructural y vale para los
 * dos arquetipos: hero = la siguiente, cuerpo = de la de después al slider.
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
  construccion: [
    "https://kunakair.com/es/sectores/contaminacion-por-construccion/",
    "http://localhost:3000/sectores/contaminacion-por-construccion",
  ],
  investigacion: [
    "https://kunakair.com/es/sectores/estudio-de-la-contaminacion-atmosferica/",
    "http://localhost:3000/sectores/estudio-de-la-contaminacion-atmosferica",
  ],
  // arquetipo MONOGRÁFICO TÉCNICO
  edar: [
    "https://kunakair.com/es/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar/",
    "http://localhost:3000/sectores/monitorizacion-ambiental-y-control-de-olores-en-edar",
  ],
  petroleo: [
    "https://kunakair.com/es/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas/",
    "http://localhost:3000/sectores/monitorizacion-de-emisiones-en-petroleo-y-gas",
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
    const sinEsp = (el) => (el.textContent || "").replace(/\s+/g, "");
    if (esOriginal) {
      secs = [...document.querySelectorAll(".et_pb_section")];
      // el breadcrumb, no el `pb` del hero: sirve para los dos arquetipos
      const iMigas = secs.findIndex((s) => sinEsp(s).startsWith("InicioSectores"));
      const iSlider = secs.findIndex((s) => s.classList.contains("et_pb_fullwidth_section"));
      secs = secs.slice(iMigas + 2, iSlider);
      filaSel = ":scope > .et_pb_row";
    } else {
      const todas = [...document.querySelectorAll("main > section")];
      // El hero es la única sección con `pb-[20px]`: la cabecera cierra a 40 y
      // el resto no lleva esa clase. Vale para los dos arquetipos, porque lo
      // que cambia entre ellos es el `pb` de DESKTOP (39 vs 60), no el móvil.
      const iHero = todas.findIndex((s) => /pb-\[20px\]/.test(s.className));
      // El slider es la ÚLTIMA sección con `.swiper`: la banda de clientes
      // también lleva uno, y va ANTES del hero. Buscando el primero, el corte
      // caía en la banda y el cuerpo del clon salía vacío.
      let iSlider = -1;
      todas.forEach((s, i) => {
        if (s.querySelector(".swiper")) iSlider = i;
      });
      secs = todas.slice(iHero + 1, iSlider > iHero ? iSlider : undefined);
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
