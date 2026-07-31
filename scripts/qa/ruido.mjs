/**
 * SUELO DE RUIDO DEL ORIGINAL — cuánto se mueve kunakair.com entre corridas.
 * Uso: node ruido.mjs [corridas]     (por defecto 3)
 *
 * Por qué existe: el original **no es un objetivo de medición estable**. Dos
 * corridas del mismo día leyeron el h1 de Industria a 219.4 y a 189.4 (el clon
 * dio 189.4 en las dos), y el `docH` de la misma página a 7117 y 7144. Sin un
 * suelo medido no hay forma de saber si un Δ pequeño es un defecto del clon o
 * es el original respirando.
 *
 * Separa DOS magnitudes, porque no tienen el mismo ruido y confundirlas hace
 * descartar defectos reales:
 *   · POSICIONAL — `docH`, y el `top` del h1 y del pie. Acumula todo lo que
 *     pase más arriba (una línea que envuelve, un aviso, una fuente que carga
 *     tarde), así que es la magnitud ruidosa.
 *   · DIMENSIONAL — el alto de cada `.et_pb_row`. No acumula nada de fuera de
 *     la fila, así que es mucho más estable. Un Δ de alto de caja NO se juzga
 *     contra el suelo posicional.
 */
import { launch, openPage, settle, w } from "./lib.mjs";

const PAGINAS = [
  ["home", "https://kunakair.com/es/"],
  ["monitor", "https://kunakair.com/es/monitor-calidad-aire/"],
  ["accesorios", "https://kunakair.com/es/accesorios/"],
  ["software", "https://kunakair.com/es/software-de-medicion-calidad-del-aire/"],
  ["api", "https://kunakair.com/es/kunak-api/"],
  ["urbano", "https://kunakair.com/es/sectores/calidad-del-aire-en-las-ciudades/"],
  ["industria", "https://kunakair.com/es/sectores/control-de-emisiones-industriales/"],
];

const CORRIDAS = Number(process.argv[2] || 3);
const { browser } = await launch();
const crudo = {};

for (const ancho of [1440, 390]) {
  const mobile = ancho <= 500;
  for (let corrida = 0; corrida < CORRIDAS; corrida++) {
    for (const [nombre, url] of PAGINAS) {
      const clave = `${nombre}@${ancho}`;
      try {
        const { page } = await openPage(browser, url, {
          width: ancho,
          height: mobile ? 844 : 900,
          mobile,
        });
        await settle(page);
        const m = await page.evaluate(() => {
          const r = (n) => Math.round(n * 100) / 100;
          const y = (el) => (el ? r(el.getBoundingClientRect().top + scrollY) : null);
          return {
            docH: document.documentElement.scrollHeight,
            h1: y(document.querySelector("h1")),
            pie: y(document.querySelector("footer, .et_pb_section_0_tb_footer")),
            filas: [...document.querySelectorAll(".et_pb_row")].map((f) =>
              r(f.getBoundingClientRect().height),
            ),
          };
        });
        (crudo[clave] ||= []).push(m);
        await page.close();
      } catch (e) {
        (crudo[clave] ||= []).push({ error: String(e).slice(0, 80) });
      }
    }
  }
}

/* ─────────────────────────── dispersión por página ─────────────────────────── */

const disp = (xs) => {
  const v = xs.filter((n) => typeof n === "number");
  if (v.length < 2) return null;
  return Math.round((Math.max(...v) - Math.min(...v)) * 100) / 100;
};

const resumen = {};
for (const [clave, corridas] of Object.entries(crudo)) {
  const ok = corridas.filter((c) => !c.error);
  if (ok.length < 2) {
    resumen[clave] = { error: `solo ${ok.length} corrida(s) válida(s)` };
    continue;
  }
  // posicional
  const pos = {
    docH: disp(ok.map((c) => c.docH)),
    h1: disp(ok.map((c) => c.h1)),
    pie: disp(ok.map((c) => c.pie)),
  };
  // dimensional: dispersión de cada fila por índice, y el peor caso
  const nFilas = Math.min(...ok.map((c) => c.filas.length));
  const mismasFilas = ok.every((c) => c.filas.length === nFilas);
  const porFila = [];
  for (let i = 0; i < nFilas; i++) porFila.push(disp(ok.map((c) => c.filas[i])));
  resumen[clave] = {
    corridas: ok.length,
    posicional: pos,
    posicionalMax: Math.max(...Object.values(pos).filter((n) => n !== null)),
    dimensionalMax: porFila.length ? Math.max(...porFila.filter((n) => n !== null)) : null,
    filas: nFilas,
    mismoNumeroDeFilas: mismasFilas,
  };
}

w("medidas/ruido-crudo.json", crudo);
w("medidas/ruido.json", resumen);

console.log(`\n===== SUELO DE RUIDO DEL ORIGINAL · ${CORRIDAS} corridas =====`);
console.log(
  "página".padEnd(18) +
    "docH".padStart(8) +
    "h1".padStart(8) +
    "pie".padStart(9) +
    "POS max".padStart(10) +
    "DIM max".padStart(10),
);
for (const [clave, r] of Object.entries(resumen)) {
  if (r.error) {
    console.log(clave.padEnd(18) + "  " + r.error);
    continue;
  }
  console.log(
    clave.padEnd(18) +
      String(r.posicional.docH).padStart(8) +
      String(r.posicional.h1).padStart(8) +
      String(r.posicional.pie).padStart(9) +
      String(r.posicionalMax).padStart(10) +
      String(r.dimensionalMax).padStart(10) +
      (r.mismoNumeroDeFilas ? "" : "   ⚠ nº de filas variable"),
  );
}

const todosPos = Object.values(resumen).filter((r) => !r.error).map((r) => r.posicionalMax);
const todosDim = Object.values(resumen).filter((r) => !r.error).map((r) => r.dimensionalMax);
console.log(
  `\nSUELO POSICIONAL  = ${Math.max(...todosPos)}   (peor página)` +
    `\nSUELO DIMENSIONAL = ${Math.max(...todosDim.filter((n) => n !== null))}`,
);

await browser.close();
