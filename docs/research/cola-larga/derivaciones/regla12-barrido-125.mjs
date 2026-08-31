// 125.ª · BARRIDO DE §regla 12, ACOTADO — ¿que enunciados con FORMA DE REGLA
// viven solo en un acta y deberian estar en CLAUDE.md?
//
// §regla 12: un acta se lee UNA VEZ, en su sesion; `CLAUDE.md` se lee CADA
// sesion. Un enunciado con forma de REGLA GENERAL escrito solo en un acta
// equivale a no haberlo escrito — se vuelve a pagar.
//
// ⚠ SE HACE ACOTADO, no sobre el archivo entero: barrer 7 000 lineas de HANDOFF
// produce ruido y ninguna decision. Alcance: las actas de la FASE EN CURSO.
//
// ⚠⚠ Y EL NUMERO SE ESCRIBE AUNQUE SEA CERO — «no encontre ninguna» y «no
// barri» son la misma salida si no se dice (§regla del cero).
//
// EL DISCRIMINADOR, que es lo operativo: quitale la FECHA y el NOMBRE PROPIO.
//   · si sigue diciendo QUE HACER la proxima vez ⇒ REGLA ⇒ va a CLAUDE.md
//   · si describe QUE PASO, con su numero y su ruta  ⇒ EVENTO ⇒ se queda

import { readFileSync, existsSync, writeFileSync } from "node:fs";

const ALCANCE = [
  { fichero: "docs/PLAN-FASE-3.md", desde: /^## F3-5/m, razon: "la fase en curso" },
  { fichero: "docs/PENDIENTES-QA.md", desde: null, soloUltimas: 400, razon: "el registro vivo de QA, cola" },
];
const CLAUDE = existsSync("CLAUDE.md") ? readFileSync("CLAUDE.md", "utf8") : "";
if (!CLAUDE) { console.error("❌ PRECONDICION: no hay CLAUDE.md contra el que cruzar"); process.exit(1); }

/* La forma que este repo usa para un enunciado destacado: una linea de cita que
 * empieza con negrita en MAYUSCULAS. */
const FORMA = /^>+\s*(?:⚠+\s*)?\*\*([A-ZÁÉÍÓÚÑ][^*]{25,200})\*\*/;

const candidatos = [];
for (const a of ALCANCE) {
  if (!existsSync(a.fichero)) { candidatos.push({ fichero: a.fichero, error: "no existe" }); continue; }
  let txt = readFileSync(a.fichero, "utf8");
  if (a.desde) { const m = txt.match(a.desde); txt = m ? txt.slice(m.index) : txt; }
  const lineas = txt.split(/\r?\n/);
  const trozo = a.soloUltimas ? lineas.slice(-a.soloUltimas) : lineas;
  for (const [i, l] of trozo.entries()) {
    const m = l.match(FORMA);
    if (!m) continue;
    const enunciado = m[1].replace(/\s+/g, " ").trim();
    /* ¿esta ya en CLAUDE.md? se cruza por una firma de palabras largas, no por
     * el literal: la redaccion cambia al subirlo */
    const palabras = enunciado.toLowerCase().replace(/[^\wáéíóúñ\s]/g, " ").split(/\s+/).filter((w) => w.length >= 6);
    const firma = palabras.slice(0, 6);
    const enClaude = firma.length >= 3 && firma.filter((w) => CLAUDE.toLowerCase().includes(w)).length >= Math.ceil(firma.length * 0.8);
    /* EVENTO o REGLA: un evento trae fecha o ruta propia */
    const tieneFecha = /20\d\d-\d\d-\d\d|\d+\.ª/.test(enunciado);
    candidatos.push({ fichero: a.fichero, enunciado: enunciado.slice(0, 150), tieneFecha, enClaude });
  }
}

const vivos = candidatos.filter((c) => !c.error);
const posiblesReglas = vivos.filter((c) => !c.enClaude && !c.tieneFecha);

const controles = [];
controles.push({ nombre: "el barrido alcanzo su ambito (encontro enunciados con la forma)", ok: vivos.length > 0, visto: `${vivos.length} enunciados destacados en ${ALCANCE.length} ficheros` });
/* ⚠ si TODOS salieran «no estan en CLAUDE», el cruce no estaria cruzando
 * (§*un patron que casa en TODAS tampoco mide nada*). */
controles.push({ nombre: "el cruce contra CLAUDE.md DISCRIMINA", ok: vivos.some((c) => c.enClaude) && vivos.some((c) => !c.enClaude), visto: `ya en CLAUDE ${vivos.filter((c) => c.enClaude).length} · no ${vivos.filter((c) => !c.enClaude).length}` });
const nulo = controles.some((c) => !c.ok);

const salida = {
  meta: { tanda: "125.ª · CIERRE — barrido §regla 12", fecha: new Date().toISOString().slice(0, 10), alcance: ALCANCE.map((a) => `${a.fichero} (${a.razon})`), noContesta: ["el archivo entero: el barrido es ACOTADO por diseño, y eso es una limitación declarada, no un descuido"] },
  controles,
  cardinales: { enunciadosDestacados: vivos.length, yaEnClaudeMd: vivos.filter((c) => c.enClaude).length, conFechaOTanda_eventos: vivos.filter((c) => c.tieneFecha && !c.enClaude).length, candidatosARegla: posiblesReglas.length },
  candidatosARegla: posiblesReglas.map((c) => ({ fichero: c.fichero, enunciado: c.enunciado })),
  veredicto: nulo ? "NULA — control en rojo" : "valida",
};
writeFileSync("docs/research/cola-larga/derivaciones/regla12-barrido-125.json", JSON.stringify(salida, null, 2) + "\n", "utf8");

console.log("=== CONTROLES ===");
for (const c of controles) console.log(`  ${c.ok ? "OK " : "RED"} ${c.nombre}\n      ${c.visto}`);
console.log("");
console.log("=== CARDINALES (se escriben AUNQUE SEAN CERO) ===");
for (const [k, v] of Object.entries(salida.cardinales)) console.log(`  ${String(v).padStart(4)}  ${k}`);
console.log("");
console.log("=== CANDIDATOS A REGLA (sin fecha, no cruzados en CLAUDE.md) ===");
if (!posiblesReglas.length) console.log("  ninguno — y eso es el resultado, no la ausencia de barrido");
for (const c of posiblesReglas) console.log(`  ${c.fichero}\n    ${c.enunciado}`);
console.log("");
console.log(`VEREDICTO: ${salida.veredicto}`);
process.exit(nulo ? 1 : 0);
