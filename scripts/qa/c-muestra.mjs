/**
 * MUESTRA ADVERSARIA DEL GRUPO C — la lectura fina, elegida por máquina.
 * Uso: npm run qa:c-muestra          (no necesita navegador ni red)
 *
 * ── Qué se muestrea y qué NO ───────────────────────────────────────────────
 * **NO se muestrea el censo**: el cascarón, los campos visibles y las etiquetas
 * ya están medidos en las 76/76 (`c-censo.mjs`), porque eso es `fetch` + parseo.
 * Lo que se muestrea es lo caro: abrir la página en un navegador y mirarla.
 *
 * ── La regla, PRE-REGISTRADA ───────────────────────────────────────────────
 * Escrita antes de ver los resultados, y aplicada por la máquina, no a ojo. Por
 * forma, en este orden y sin repetir:
 *
 *   1 · la MÁS LARGA de cuerpo         (dónde revienta el contrato)
 *   2 · la MÁS CORTA de cuerpo         (dónde falta todo)
 *   3 · una por PAYLOAD RARO           (script · video · iframe · table · sup)
 *   4 · la de MÁS VARIEDAD de etiquetas
 *   5 · la de MENOS campos opcionales  (el esqueleto pelado)
 *   6 · relleno ALEATORIO con semilla fija hasta el cupo
 *
 * El relleno usa un PRNG propio con semilla constante: la misma entrada da la
 * misma muestra, que es lo que hace auditable una selección aleatoria.
 *
 * ⚠ Los 4 de `/case-studies/` entran **ENTEROS**, no muestreados: son 4 y son la
 * evidencia de CMS-1. Muestrear 4 no ahorra nada y pierde el caso.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, QA, w } from "./lib.mjs";

const SEMILLA = 20260730; // constante: la muestra tiene que ser reproducible
const CUPO = { "caso-es": 8, faq: 4 }; // los 4 de caso-en van enteros

const censo = JSON.parse(readFileSync(join(QA, "medidas/c-censo.json"), "utf8"));
const ok = censo.paginas.filter((p) => !p.error);

/** PRNG determinista (mulberry32). Sin esto «aleatorio» no es reproducible. */
function prng(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const esCuerpo = (c) => /entry-content-(need|solution|results)/.test(c) || c.trim() === "entry-content";

/** Señales por página, todas sacadas del censo: la muestra no vuelve a medir. */
function senales(p) {
  const bloques = p.cuerpo.entryContent.filter((e) => esCuerpo(e.clase));
  const etiquetas = new Set();
  for (const b of bloques) for (const t of Object.keys(b.etiquetas)) etiquetas.add(t);
  const c = p.campos;
  return {
    chars: bloques.reduce((a, b) => a + b.chars, 0),
    variedad: etiquetas.size,
    etiquetas: [...etiquetas],
    opcionales: [c.textoDestacado, c.galeria, c.soluciones, c.detalles?.tieneMapa].filter(Boolean).length,
  };
}

const RAROS = ["script", "video", "iframe", "table", "sup"];

function elegir(lista, cupo) {
  const s = new Map(lista.map((p) => [p.url, senales(p)]));
  const puestos = new Map(); // url → razones

  const meter = (p, razon) => {
    if (!p) return;
    if (puestos.has(p.url)) puestos.get(p.url).push(razon);
    else puestos.set(p.url, [razon]);
  };
  const libres = () => lista.filter((p) => !puestos.has(p.url));
  const max = (arr, fn) => arr.reduce((a, b) => (fn(b) > fn(a) ? b : a), arr[0]);
  const min = (arr, fn) => arr.reduce((a, b) => (fn(b) < fn(a) ? b : a), arr[0]);

  if (lista.length) {
    meter(max(lista, (p) => s.get(p.url).chars), "la más larga");
    meter(min(lista, (p) => s.get(p.url).chars), "la más corta");
    for (const raro of RAROS) {
      const cand = libres().filter((p) => s.get(p.url).etiquetas.includes(raro));
      if (cand.length) meter(max(cand, (p) => s.get(p.url).chars), `payload raro: ${raro}`);
    }
    if (libres().length) meter(max(libres(), (p) => s.get(p.url).variedad), "más variedad de etiquetas");
    if (libres().length) meter(min(libres(), (p) => s.get(p.url).opcionales), "menos campos opcionales");
  }

  // relleno con semilla fija hasta el cupo
  const azar = prng(SEMILLA);
  const resto = libres().slice().sort((a, b) => a.url.localeCompare(b.url)); // orden estable ANTES de barajar
  while (puestos.size < Math.min(cupo, lista.length) && resto.length) {
    const i = Math.floor(azar() * resto.length);
    meter(resto.splice(i, 1)[0], "relleno aleatorio (semilla fija)");
  }

  return [...puestos.entries()].map(([url, razones]) => ({
    url,
    razones,
    ...s.get(url),
    etiquetas: undefined, // el detalle vive en el censo; aquí sobra
  }));
}

/* ═══════════════════════════════ selección ═══════════════════════════════ */

console.log(`\n════════ MUESTRA ADVERSARIA DEL GRUPO C · semilla ${SEMILLA} ════════`);

const salida = {
  meta: {
    fecha: "2026-07-30",
    semilla: SEMILLA,
    regla: "pre-registrada en docs/research/grupo-C/PLAN-MUESTREO.md §3",
    base: "medidas/c-censo.json (censo 76/76)",
    nota: "caso-en entra entero (4): son la evidencia de CMS-1, muestrearlos no ahorra nada",
  },
  formas: {},
};

for (const forma of ["caso-es", "caso-en", "faq"]) {
  const lista = ok.filter((p) => p.forma === forma);
  const cupo = CUPO[forma] ?? lista.length;
  const muestra = forma === "caso-en" ? lista.map((p) => ({ url: p.url, razones: ["entera: son 4"], ...senales(p), etiquetas: undefined })) : elegir(lista, cupo);
  salida.formas[forma] = { total: lista.length, cupo, muestra };
  console.log(`\n  ── ${forma} · ${muestra.length} de ${lista.length} ──`);
  for (const m of muestra)
    console.log(
      `    ${String(m.chars).padStart(6)} ch · ${String(m.variedad).padStart(2)} etq · ${m.opcionales} opc  ` +
        `${m.url.replace("https://kunakair.com/es/", "").slice(0, 46).padEnd(48)} ${m.razones.join(" + ")}`,
    );
}

/* ── COBERTURA de los payloads raros, dicha en voz alta ──────────────────
 *
 * ⚠ Sin esto la salida MIENTE por omisión. La regla del payload raro solo mira
 * las páginas aún libres, así que si la única con `<script>` ya entró como «la
 * más larga», no se imprime ninguna línea de `script` — y eso se lee como «no
 * está cubierto» cuando sí lo está. Un elemento que se mira y no se cuenta da el
 * mismo informe que uno que no se ha mirado (`CLAUDE.md` §Reglas sobre las sondas, 1).
 */
const seleccionadas = new Set(Object.values(salida.formas).flatMap((f) => f.muestra.map((m) => m.url)));
const cobertura = {};
for (const raro of RAROS) {
  const conEl = ok.filter((p) => senales(p).etiquetas.includes(raro));
  const cubiertas = conEl.filter((p) => seleccionadas.has(p.url));
  cobertura[raro] = { paginasConEl: conEl.length, enLaMuestra: cubiertas.length };
}
salida.cobertura = cobertura;

console.log(`\n  ── cobertura de payloads raros ──`);
for (const [raro, c] of Object.entries(cobertura)) {
  const estado = c.paginasConEl === 0 ? "— no existe en el corpus" : c.enLaMuestra > 0 ? "✅ cubierto" : "❌ SIN CUBRIR";
  console.log(`    ${raro.padEnd(8)} ${String(c.paginasConEl).padStart(2)} páginas lo tienen · ${c.enLaMuestra} en la muestra  ${estado}`);
}

const sinCubrir = Object.entries(cobertura).filter(([, c]) => c.paginasConEl > 0 && c.enLaMuestra === 0);

const total = Object.values(salida.formas).reduce((a, f) => a + f.muestra.length, 0);
/**
 * Contrato de `Evaluadas` (lib.mjs). Aquí la unidad es **una página elegida para
 * la muestra**, y el mínimo es **una por forma**: una muestra adversaria que se
 * quede sin páginas en alguna forma no es «una muestra pequeña», es una muestra
 * que no cubre lo que dice cubrir. Por debajo sale NO SE PUDO EVALUAR.
 *
 * ⚠ Se declara a mano y no con el barrido automático de la tanda: aquí el bucle
 * de nivel 0 que parecía el bueno estaba **anidado**, y meter la declaración
 * dentro habría dado un fichero que compila y una `ev` fuera de alcance. Es la
 * automatización produciendo algo plausible; lo cazó revisar el diff.
 */
const ev = new Evaluadas({ nombre: "c-muestra", unidad: "páginas de la muestra", minimo: Object.keys(salida.formas).length });
ev.ok(total);
salida.resumen = { total, de: ok.length, payloadsSinCubrir: sinCubrir.map(([r]) => r) };
console.log(`\n════════ ${total} páginas para lectura fina, de ${ok.length} censadas ════════`);

w("medidas/c-muestra.json", salida);

/* Código 0 solo si todo payload que existe en el corpus está representado. */
console.log(
  `\n${sinCubrir.length === 0 ? "✅" : "❌"} ${sinCubrir.length === 0 ? "todos los payloads raros del corpus están en la muestra" : `sin cubrir: ${sinCubrir.map(([r]) => r).join(", ")}`}`,
);
process.exit(sinCubrir.length === 0 ? 0 : 1);
