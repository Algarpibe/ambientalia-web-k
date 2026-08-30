// 123.ª · ESCALON 1 (1) — ANTES DE CONSTRUIR: ¿ya mide alguien filas/modulos de
// las 4 rutas del lote?
//
// El encargo lo pide explicitamente: «EMPIEZA POR EL ARCHIVO». Construir un
// comparador que ya existe es caro, pero declararlo inexistente sin barrer es
// peor: §*«no hay instancia separadora» es una afirmacion sobre las que SE
// BUSCARON*.
//
// El cruce tiene DOS ejes y hacen falta los dos:
//   NIVEL   — ¿la sonda mide fila o modulo? (selector de Divi o campo emitido)
//   UNIVERSO— ¿alguna de las 4 rutas del lote esta en lo que recorre?
//
// Una sonda que mide el nivel sobre OTRAS rutas no sirve, y una que recorre mis
// rutas sin medir el nivel, tampoco. Solo el cruce contesta.
//
// CONTROLES (§sondas 4, las tres caras):
//   · cero    — el filtro tiene que casar en alguna (si no, mide el filtro)
//   · pleno   — no puede casar en todas (si no, no discrimina)
//   · conocido— `mono-cmp` mide modulos y `tree-cmp` filas: si el detector de
//               NIVEL no los ve, esta roto. Caso conocido de antemano.

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "scripts/qa";
const LOTE = [
  "/monitor-calidad-aire",
  "/accesorios",
  "/software-de-medicion-calidad-del-aire",
  "/kunak-api",
];

// NIVEL: como se nombra una fila o un modulo en este repo.
//
// ⚠ La v1 usaba /\bfilas?\b/ y /\bmodulos?\b/ y casaba en 119 de 218 sondas
// (54 %) — la palabra «fila» aparece en cualquier comentario o variable. Un
// detector que casa en la mitad del archivo no discrimina (§sondas 4, cara del
// sobre-casado), y de ahi salian 11 «sondas que sirven» de las que ruido.mjs,
// slugs.mjs y a-miga.mjs no miden filas de Divi en absoluto.
//
// Lo que discrimina es el SELECTOR con el que se toca el nivel, no la palabra.
const RE_FILA = /et_pb_row|data-fila|\bnFilas\b|\bfilas\.length\b/;
const RE_MODULO = /et_pb_module\b|et_pb_module_header|\bnModulos\b|\bmodulos\.length\b/;

const sondas = readdirSync(DIR)
  .filter((f) => /\.mjs$/.test(f) && f !== "lib.mjs" && f !== "lib.test.mjs")
  .sort();

const filas = sondas.map((f) => {
  const src = readFileSync(join(DIR, f), "utf8");
  const cuerpo = src.replace(/^\s*\/\/.*$/gm, ""); // los comentarios no miden
  const mideFila = RE_FILA.test(cuerpo);
  const mideModulo = RE_MODULO.test(cuerpo);
  const rutas = LOTE.filter((r) => src.includes(r));
  // ¿compara DOS lados? un comparador nombra el original de algun modo
  const dosLados = /ORIG|orig(inal)?\b|kunakair\.com|file:\/\//i.test(cuerpo) && /CLON|clon\b|localhost|127\.0\.0\.1/i.test(cuerpo);
  return {
    sonda: f,
    negativo: /\.neg\.mjs$/.test(f),
    mideFila,
    mideModulo,
    mideNivel: mideFila || mideModulo,
    rutasDelLote: rutas,
    dosLados,
    // SIRVE = mide el nivel Y ve al menos una ruta del lote Y compara dos lados
    sirve: (mideFila || mideModulo) && rutas.length > 0 && dosLados,
  };
});

// ── CONTROLES ────────────────────────────────────────────────────────────────
const controles = [];
const nNivel = filas.filter((f) => f.mideNivel).length;
controles.push({
  nombre: "el detector de NIVEL no es un cero ni un pleno",
  ok: nNivel > 0 && nNivel < filas.length,
  visto: `${nNivel} de ${filas.length} sondas mencionan fila o modulo`,
});
const conocidas = ["mono-cmp.mjs", "tree-cmp.mjs"];
const vistasConocidas = conocidas.filter((c) => filas.find((f) => f.sonda === c)?.mideNivel);
controles.push({
  nombre: "el detector de NIVEL ve los casos CONOCIDOS (mono-cmp mide modulos, tree-cmp filas)",
  ok: vistasConocidas.length === conocidas.length,
  visto: `${vistasConocidas.join(",") || "ninguna"} de ${conocidas.join(",")}`,
});
const nUniverso = filas.filter((f) => f.rutasDelLote.length).length;
controles.push({
  nombre: "el detector de UNIVERSO no es un cero ni un pleno",
  ok: nUniverso > 0 && nUniverso < filas.length,
  visto: `${nUniverso} de ${filas.length} sondas nombran alguna ruta del lote`,
});

const sirven = filas.filter((f) => f.sirve && !f.negativo);

const salida = {
  meta: {
    tanda: "123.ª · ESCALON 1 (1)",
    fecha: new Date().toISOString().slice(0, 10),
    pregunta: "¿existe ya una sonda que compare FILAS o MODULOS de las 4 rutas del lote contra el original?",
    noContesta: [
      "si esa sonda MIDE BIEN (esto es un barrido del fuente, no una corrida)",
      "si su lado original esta capturado con sus hojas",
    ],
    lote: LOTE,
  },
  controles,
  cardinales: {
    sondas: filas.length,
    mencionanNivel: nNivel,
    nombranRutaDelLote: nUniverso,
    cruceQueSIRVE: sirven.length,
  },
  sirven,
  // los dos lados del cruce por separado, para poder auditar el cero
  soloNivel: filas.filter((f) => f.mideNivel && !f.rutasDelLote.length && !f.negativo).map((f) => f.sonda),
  soloUniverso: filas.filter((f) => !f.mideNivel && f.rutasDelLote.length && !f.negativo).map((f) => f.sonda),
  nivelYUniversoSinDosLados: filas.filter((f) => f.mideNivel && f.rutasDelLote.length && !f.dosLados && !f.negativo).map((f) => f.sonda),
};
writeFileSync("docs/research/cola-larga/derivaciones/archivo-sondas-123.json", JSON.stringify(salida, null, 2) + "\n", "utf8");

console.log("=== CONTROLES ===");
for (const c of controles) console.log(`  ${c.ok ? "OK " : "RED"} ${c.nombre}\n      ${c.visto}`);
console.log("");
console.log("=== CARDINALES ===");
for (const [k, v] of Object.entries(salida.cardinales)) console.log(`  ${k.padEnd(24)} ${v}`);
console.log("");
console.log("=== SONDAS QUE SIRVEN (nivel + ruta del lote + dos lados) ===");
if (!sirven.length) console.log("  ninguna");
for (const s of sirven) {
  console.log(`  ${s.sonda.padEnd(22)} fila=${s.mideFila ? "si" : "no"} modulo=${s.mideModulo ? "si" : "no"}  rutas: ${s.rutasDelLote.join(" ")}`);
}
console.log("");
console.log(`=== y los dos lados por separado, para auditar el cero ===`);
console.log(`  miden NIVEL pero NO ven mis rutas (${salida.soloNivel.length}): ${salida.soloNivel.slice(0, 14).join(" ")}${salida.soloNivel.length > 14 ? " …" : ""}`);
console.log(`  ven mis rutas pero NO miden nivel (${salida.soloUniverso.length}): ${salida.soloUniverso.join(" ")}`);
console.log(`  nivel + rutas pero NO dos lados (${salida.nivelYUniversoSinDosLados.length}): ${salida.nivelYUniversoSinDosLados.join(" ")}`);

const nulo = controles.some((c) => !c.ok);
console.log("");
console.log(`VEREDICTO: ${nulo ? "NULA — control en rojo" : "valida"}`);
if (nulo) process.exit(1);
