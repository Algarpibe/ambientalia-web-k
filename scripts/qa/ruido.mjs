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
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { QA, env, envRutas, launch, openPage, settle, w } from "./lib.mjs";

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
      /**
       * ⚠ El TIEMPO DE CARGA se congela junto a cada medida (2026-07-31, para
       * la ráfaga 2 de cqa6). La hipótesis que debe poder contestarse desde el
       * fichero: el ±32.28 sincronizado correlaciona con la latencia del
       * original (carga lenta → fuentes/imágenes sin asentar → el `h1` envuelve
       * distinto). Cubre navegación + settle —todo lo que ve la medida— y se
       * guarda también en el error: un timeout ES un dato de latencia.
       */
      const t0 = Date.now();
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
        m.cargaMs = Date.now() - t0;
        (crudo[clave] ||= []).push(m);
        await page.close();
      } catch (e) {
        (crudo[clave] ||= []).push({ error: String(e).slice(0, 80), cargaMs: Date.now() - t0 });
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
  /** El tiempo de carga de la combinación: min/max entre corridas. La
   *  correlación latencia↔episodio se lee de aquí y del crudo. */
  const cargas = corridas.map((c) => c.cargaMs).filter((n) => typeof n === "number");
  resumen[clave] = {
    corridas: ok.length,
    posicional: pos,
    posicionalMax: Math.max(...Object.values(pos).filter((n) => n !== null)),
    dimensionalMax: dimMax,
    cargaMs: cargas.length ? { min: Math.min(...cargas), max: Math.max(...cargas) } : null,
    /** Por qué no hay dimensional, cuando no lo hay. */
    dimensionalNoMedible: mismasFilas ? null : `el nº de .et_pb_row varía entre corridas (${ok.map((c) => c.filas.length).join("/")}): comparar por índice compararía filas distintas`,
    filas: nFilas,
    mismoNumeroDeFilas: mismasFilas,
  };
}

/* ══════════════════════════════════════════════════════════════════════════
 * LA CAMPAÑA — porque una ráfaga no es un suelo.
 *
 * `CAMPANA=<nombre>` guarda esta ráfaga como **un fichero propio con su sello
 * de tiempo** dentro de `medidas/campana/<nombre>/`, y después lee **todas** las
 * ráfagas de esa campaña para dar el estado.
 *
 * Por qué un fichero por ráfaga y no uno que se actualiza: porque el suelo es el
 * **máximo entre ráfagas separadas en el tiempo**, así que cada ráfaga es un
 * dato independiente que hay que poder exhibir. Y porque la guarda de `w()`
 * impide (con razón) reescribir una salida congelada — una campaña que
 * acumulara en un solo fichero pelearía con ella en cada sesión.
 * ═════════════════════════════════════════════════════════════════════════ */
const CAMPANA = env("CAMPANA");
if (!CAMPANA) {
  w(`medidas/ruido-crudo${ETIQUETA}.json`, crudo);
  w(`medidas/ruido${ETIQUETA}.json`, resumen);
} else {
  const sello = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const dir = `medidas/campana/${CAMPANA}`;
  w(`${dir}/rafaga-${sello}.json`, {
    meta: { campana: CAMPANA, sello, corridas: CORRIDAS, rutas: PAGINAS.map(([n]) => n), anchos: [1440, 390] },
    resumen,
    crudo,
  });

  /* ── El estado de la campaña, leyendo TODAS las ráfagas ── */
  const abs = join(QA, dir);
  const ficheros = readdirSync(abs).filter((f) => f.startsWith("rafaga-") && f.endsWith(".json")).sort();
  const rafagas = ficheros.map((f) => JSON.parse(readFileSync(join(abs, f), "utf8")));

  /** Requisitos del protocolo (`CLAUDE.md` §Notas de método). */
  const MIN_RAFAGAS = 3;
  const MIN_DIAS = 2;
  const MIN_SEP_H = 2;

  const sellos = rafagas.map((r) => new Date(r.meta.sello.slice(0, 10) + "T" + r.meta.sello.slice(11).replace(/-/g, ":") + "Z"));
  const dias = new Set(rafagas.map((r) => r.meta.sello.slice(0, 10)));
  const ordenados = [...sellos].sort((a, b) => a - b);
  const separaciones = ordenados.slice(1).map((t, i) => (t - ordenados[i]) / 3600000);
  const bienSeparadas = separaciones.filter((h) => h >= MIN_SEP_H).length + 1;

  /** El suelo por combinación: el MÁXIMO entre ráfagas, no dentro de una. */
  const suelo = {};
  for (const r of rafagas) {
    for (const [clave, v] of Object.entries(r.resumen)) {
      if (v.error) continue;
      suelo[clave] ||= { h1: 0, pos: 0, rafagas: 0 };
      suelo[clave].h1 = Math.max(suelo[clave].h1, v.posicional.h1 ?? 0);
      suelo[clave].pos = Math.max(suelo[clave].pos, v.posicionalMax ?? 0);
      suelo[clave].rafagas++;
    }
  }

  console.log(`\n═══ CAMPAÑA «${CAMPANA}» — ${rafagas.length} ráfaga(s), ${dias.size} día(s)`);
  console.log(`  ${"combinación".padEnd(24)}${"h1 (máx entre ráfagas)".padStart(24)}${"posicional".padStart(13)}`);
  for (const [k, v] of Object.entries(suelo)) {
    console.log(`  ${k.padEnd(24)}${String(v.h1).padStart(24)}${String(v.pos).padStart(13)}`);
  }

  const completa = rafagas.length >= MIN_RAFAGAS && dias.size >= MIN_DIAS && bienSeparadas >= MIN_RAFAGAS;
  console.log(
    `\n  requisitos: ≥${MIN_RAFAGAS} ráfagas (${rafagas.length}) · ≥${MIN_DIAS} días (${dias.size}) ·` +
      ` separadas ≥${MIN_SEP_H}h (${bienSeparadas})`,
  );
  if (completa) {
    console.log(`  ✅ CAMPAÑA COMPLETA: el suelo de arriba ya se puede citar, con su fecha.`);
  } else {
    console.log(
      `  ⏳ CAMPAÑA ABIERTA — faltan ${Math.max(0, MIN_RAFAGAS - rafagas.length)} ráfaga(s) y` +
        ` ${Math.max(0, MIN_DIAS - dias.size)} día(s).\n` +
        `     Lo de arriba NO es un suelo: es «lo máximo observado hasta ahora».\n` +
        `     Una combinación a 0 significa «no se observó ruido en estos episodios»,\n` +
        `     NO «su suelo es 0». Hasta cerrar, todo residuo pequeño en estas rutas\n` +
        `     queda SIN PROBAR.`,
    );
  }
}

console.log(`\n===== SUELO DE RUIDO DEL ORIGINAL · ${CORRIDAS} corridas =====`);
console.log(
  "página".padEnd(18) +
    "docH".padStart(8) +
    "h1".padStart(8) +
    "pie".padStart(9) +
    "POS max".padStart(10) +
    "DIM max".padStart(10) +
    "carga".padStart(14),
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
      String(r.cargaMs ? `${(r.cargaMs.min / 1000).toFixed(1)}–${(r.cargaMs.max / 1000).toFixed(1)}s` : "—").padStart(14) +
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
