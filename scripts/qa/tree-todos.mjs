/**
 * S7 — el árbol de secciones/filas de los 8 sectores vivos, para diseñar el
 * content type contra la distribución REAL y no contra 2 instancias.
 * Solo el cuerpo: las secciones entre el hero (pb 60) y el slider fullwidth.
 *
 * Uso: node tree-todos.mjs [ancho]   ·   ver scripts/qa/README.md
 * De aquí sale el campo `flujo` de `SectorBlock` (src/lib/sectores.ts).
 * Salida congelada del 2026-07-28: scripts/qa/medidas/tree-todos-1440.json
 */
import { launch, openPage, settle, w } from "./lib.mjs";

const SECTORES = [
  ["urbano", "calidad-del-aire-en-las-ciudades"],
  ["industria", "control-de-emisiones-industriales"],
  ["edar", "monitorizacion-ambiental-y-control-de-olores-en-edar"],
  ["petroleo", "monitorizacion-de-emisiones-en-petroleo-y-gas"],
  ["puertos", "contaminacion-del-transporte-maritimo"],
  ["construccion", "contaminacion-por-construccion"],
  ["mineria", "contaminacion-del-aire-por-la-mineria"],
  ["investigacion", "estudio-de-la-contaminacion-atmosferica"],
];

const width = Number(process.argv[2] || 1440);
const mobile = width <= 500;
const { browser } = await launch();
const todo = {};

for (const [nombre, slug] of SECTORES) {
  try {
    const { page } = await openPage(browser, `https://kunakair.com/es/sectores/${slug}/`, {
      width,
      height: mobile ? 844 : 900,
      mobile,
    });
    await settle(page);
    const out = await page.evaluate(() => {
      const r = (n) => Math.round(n * 100) / 100;
      const txt = (el) => (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 48);
      const secs = [...document.querySelectorAll(".et_pb_section")];

      // El cuerpo va entre el hero y el slider. Localizar el hero **por su
      // `padding-bottom` no funciona**: es 60 en la plantilla clásica a 1440,
      // 20 a 390, y 39 en EDAR y Petróleo y gas, que van con otra plantilla.
      // Dos versiones de esta sonda se comieron las filas de menú y breadcrumb
      // como si fueran cuerpo por fiarse de ese número.
      //
      // El ancla estable es el BREADCRUMB, que existe en los 8 sectores y en
      // los dos anchos: su sección es la única cuyo texto empieza por
      // "InicioSectores" (concatenado, sin espacios). El hero es la siguiente
      // y el cuerpo empieza dos más allá. La fila de menú del header también
      // lleva "Inicio" y "Sectores", pero no en ese orden ni al principio.
      const sinEspacios = (el) => (el.textContent || "").replace(/\s+/g, "");
      const iMigas = secs.findIndex((s) => sinEspacios(s).startsWith("InicioSectores"));
      const iHero = iMigas !== -1 ? iMigas + 1 : secs.findIndex((s) => getComputedStyle(s).paddingBottom === "60px");
      const iSlider = secs.findIndex((s) => s.classList.contains("et_pb_fullwidth_section"));
      return secs.slice(iHero + 1, iSlider).map((sec) => {
        const s = getComputedStyle(sec);
        const b = sec.getBoundingClientRect();
        return {
          h: r(b.height),
          mt: s.marginTop,
          pt: s.paddingTop,
          pb: s.paddingBottom,
          filas: [...sec.querySelectorAll(":scope > .et_pb_row")].map((f) => {
            const fs = getComputedStyle(f);
            return {
              pt: fs.paddingTop,
              pb: fs.paddingBottom,
              h: r(f.getBoundingClientRect().height),
              // huella del tipo de bloque
              tipo: f.querySelector(".calls")
                ? "ctaDescarga"
                : f.querySelector(".et_pb_map, .et_pb_map_container")
                  ? "mapaProyectos"
                  : f.querySelectorAll("ul").length >= 2
                    ? f.querySelectorAll("h3").length >= 2
                      ? "beneficiosAplicaciones"
                      : "listaSimple2Col"
                    : f.querySelector("img") && f.querySelectorAll("p").length <= 3
                      ? "claimConFoto"
                      : "?",
              txt: txt(f),
            };
          }),
        };
      });
    });
    todo[nombre] = out;
    await page.close();
  } catch (e) {
    todo[nombre] = { error: String(e).slice(0, 120) };
  }
}

w(`tree-todos-${width}.json`, todo);

for (const [nombre, secs] of Object.entries(todo)) {
  console.log(`\n### ${nombre}`);
  if (!Array.isArray(secs)) {
    console.log("   ", secs.error);
    continue;
  }
  secs.forEach((s, i) => {
    console.log(`  SEC ${i}  h ${String(s.h).padStart(8)}  mt ${s.mt.padStart(8)}  pt ${s.pt.padStart(9)}  pb ${s.pb.padStart(8)}`);
    s.filas.forEach((f, j) =>
      console.log(`     fila ${j}  pt ${f.pt.padStart(9)}  pb ${f.pb.padStart(9)}  h ${String(f.h).padStart(8)}  ${f.tipo.padEnd(24)} | ${f.txt}`),
    );
  });
}

await browser.close();
