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
import { env, envRutas, launch, openPage, settle, w } from "./lib.mjs";

/**
 * ⚠ **LA LISTA ES EL ALCANCE DE LA AFIRMACIÓN, y durante meses no se leyó así.**
 *
 * De estas 7 páginas × 2 anchos salen las **14 combinaciones** cuya dispersión
 * de `h1` fue 0 en 42 cargas, y de ahí la regla fundacional de `CLAUDE.md`: *la
 * base de lectura es el `h1`*. Lo que la regla NO dice es que esas 7 son las que
 * había clonadas **en julio de 2026**: no incluyen los dos monográficos, ni el
 * caso, ni la FAQ. La afirmación se citaba como si valiera para el sitio entero.
 *
 * Por eso ahora la lista se puede pasar por fuera: medir el suelo de una ruta
 * nueva tiene que ser correr la sonda, no editarla.
 *
 *   RUTAS=/software-de-medicion-calidad-del-aire,/sectores/x ETIQUETA=cqa6 \
 *     npm run qa:ruido -- 3
 */
const PORDEFECTO = [
  ["home", "https://kunakair.com/es/"],
  ["monitor", "https://kunakair.com/es/monitor-calidad-aire/"],
  ["accesorios", "https://kunakair.com/es/accesorios/"],
  ["software", "https://kunakair.com/es/software-de-medicion-calidad-del-aire/"],
  ["api", "https://kunakair.com/es/kunak-api/"],
  ["urbano", "https://kunakair.com/es/sectores/calidad-del-aire-en-las-ciudades/"],
  ["industria", "https://kunakair.com/es/sectores/control-de-emisiones-industriales/"],
];

/** `RUTAS` acota/sustituye la lista. El nombre corto sale del último segmento. */
const PEDIDAS = envRutas("RUTAS");
const PAGINAS = PEDIDAS
  ? PEDIDAS.map((r) => [r.split("/").filter(Boolean).pop().slice(0, 16), `https://kunakair.com/es${r}/`])
  : PORDEFECTO;

/** Sufijo de la salida, para no mezclar el suelo general con el de una tanda. */
const ETIQUETA = env("ETIQUETA") ? `-${env("ETIQUETA")}` : "";

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
  /**
   * Dimensional: dispersión de cada fila **por índice**.
   *
   * ⚠ **Y por eso solo vale si el nº de filas NO cambia entre corridas.** Si
   * cambia, el índice `i` señala filas distintas en cada carga y la resta
   * compara peras con manzanas: sale un número enorme —8950.73 en la primera
   * corrida de C-QA6— que parece «el sitio es un caos» y en realidad es la
   * sonda restando la fila 7 de una carga menos la fila 7 de otra que no es la
   * misma fila.
   *
   * La sonda ya IMPRIMÍA «⚠ nº de filas variable» y **contaba igual el
   * número**: la regla 1 de `CLAUDE.md` §sondas, un canal de verdad, rota en el
   * propio informe. Ahora, si el nº de filas varía, el dimensional vale `null`
   * y se dice por qué. Un dato que no se puede calcular no se calcula.
   */
  const nFilas = Math.min(...ok.map((c) => c.filas.length));
  const mismasFilas = ok.every((c) => c.filas.length === nFilas);
  let dimMax = null;
  if (mismasFilas) {
    const porFila = [];
    for (let i = 0; i < nFilas; i++) porFila.push(disp(ok.map((c) => c.filas[i])));
    dimMax = porFila.length ? Math.max(...porFila.filter((n) => n !== null)) : null;
  }
  resumen[clave] = {
    corridas: ok.length,
    posicional: pos,
    posicionalMax: Math.max(...Object.values(pos).filter((n) => n !== null)),
    dimensionalMax: dimMax,
    /** Por qué no hay dimensional, cuando no lo hay. */
    dimensionalNoMedible: mismasFilas ? null : `el nº de .et_pb_row varía entre corridas (${ok.map((c) => c.filas.length).join("/")}): comparar por índice compararía filas distintas`,
    filas: nFilas,
    mismoNumeroDeFilas: mismasFilas,
  };
}

w(`medidas/ruido-crudo${ETIQUETA}.json`, crudo);
w(`medidas/ruido${ETIQUETA}.json`, resumen);

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
      String(r.dimensionalMax ?? "—").padStart(10) +
      (r.mismoNumeroDeFilas ? "" : "   ⚠ nº de filas VARIABLE: dimensional no medible"),
  );
}

const vivos = Object.values(resumen).filter((r) => !r.error);
const todosPos = vivos.map((r) => r.posicionalMax);
const todosDim = vivos.map((r) => r.dimensionalMax).filter((n) => n !== null);
const sinDim = vivos.filter((r) => r.dimensionalMax === null).length;
console.log(
  `\nSUELO POSICIONAL  = ${Math.max(...todosPos)}   (peor página)` +
    `\nSUELO DIMENSIONAL = ${todosDim.length ? Math.max(...todosDim) : "—"}` +
    (sinDim
      ? `   ⚠ calculado sobre ${todosDim.length} de ${vivos.length}: en ${sinDim} el nº de filas varía\n` +
        `                          entre corridas, y ahí comparar por índice no mide nada.`
      : ""),
);

/**
 * ⚠ **El `h1` aparte, porque es la BASE DE LECTURA del protocolo.** Su
 * dispersión no es «una fila más» del informe: es la que decide si el resto de
 * medidas de esta ruta significan algo. Si no sale 0, la regla fundacional de
 * `CLAUDE.md` no se le aplica a esa ruta.
 */
const h1s = Object.entries(resumen).filter(([, r]) => !r.error);
const sucias = h1s.filter(([, r]) => r.posicional.h1 !== 0);
console.log(`\n═══ LA BASE DE LECTURA (\`h1\`) — ${CORRIDAS} corridas seguidas`);
if (!sucias.length) {
  console.log(`  ✅ dispersión 0 en las ${h1s.length} combinaciones medidas.`);
  console.log(
    `  ⚠ Y eso vale SOLO para estas ${h1s.length}: ${h1s.map(([k]) => k.split("@")[0]).filter((v, i, a) => a.indexOf(v) === i).join(" · ")}.\n` +
      `     «Dispersión 0» no es una propiedad del sitio, es de las rutas medidas.`,
  );
} else {
  console.log(`  ❌ ${sucias.length} combinación(es) con la BASE inestable:`);
  for (const [k, r] of sucias) console.log(`     · ${k.padEnd(22)} h1 ±${r.posicional.h1}`);
  console.log(
    `\n     Sus Δ de cuerpo NO se leen contra un suelo de 0. Hasta fijar el suyo,\n` +
      `     cualquier residuo por debajo de esa cifra queda SIN PROBAR, no limpio.`,
  );
}

/**
 * ⚠ **Y ojo con lo que estas corridas NO pueden ver.** Son N cargas seguidas, en
 * minutos. La deriva que motivó C-QA6 se observó **entre corridas separadas por
 * horas** del mismo día (±32.28 que iba y venía). Un 0 aquí descarta el
 * temblor de ráfaga; **no descarta la deriva lenta**, que es la que se comió
 * dos lecturas de esta semana.
 */
console.log(
  `\n  Alcance temporal: ${CORRIDAS} cargas SEGUIDAS. Esto mide el temblor de ráfaga.\n` +
    `  La deriva de horas —la de C-QA6— es otra magnitud y no se ve aquí.`,
);

await browser.close();
