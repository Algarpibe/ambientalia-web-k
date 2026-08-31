// 126.ª · BARRIDO DE §regla 12, ACOTADO — ¿qué enunciados con FORMA DE REGLA
// ha escrito esta tanda que sólo viven en un acta y deberían estar en CLAUDE.md?
//
// §regla 12: un acta se lee UNA VEZ, en su sesión; `CLAUDE.md` se lee CADA
// sesión. Un enunciado con forma de REGLA GENERAL escrito sólo en un acta
// equivale a no haberlo escrito — se vuelve a pagar.
//
// ⚠ ACOTADO por diseño: las secciones que ESTA tanda escribió en el ESQUEMA
// (§2n · §2ñ · §2o) más la fase en curso del plan. Barrer el archivo entero
// produce ruido y ninguna decisión.
//
// ⚠⚠ Y EL NÚMERO SE ESCRIBE AUNQUE SEA CERO — «no encontré ninguna» y «no
// barrí» son la misma salida si no se dice (§regla del cero).
//
// EL DISCRIMINADOR: quítale la FECHA y el NOMBRE PROPIO.
//   · si sigue diciendo QUÉ HACER la próxima vez ⇒ REGLA ⇒ va a CLAUDE.md
//   · si describe QUÉ PASÓ, con su número y su ruta ⇒ EVENTO ⇒ se queda

import { readFileSync, existsSync, writeFileSync } from "node:fs";

const ALCANCE = [
  { fichero: "docs/ESQUEMA-CMS.md", desde: /^# §2n · /m, razon: "las tres secciones que escribió la 126.ª" },
  { fichero: "docs/PLAN-FASE-3.md", desde: /^## F3-5/m, razon: "la fase en curso" },
];
const CLAUDE = existsSync("CLAUDE.md") ? readFileSync("CLAUDE.md", "utf8") : "";
if (!CLAUDE) { console.error("❌ PRECONDICION: no hay CLAUDE.md contra el que cruzar"); process.exit(1); }

/* La forma que este repo usa para un enunciado destacado: una línea de cita que
 * empieza con negrita en MAYÚSCULAS. Se conserva TAL CUAL la de la 125.ª: si se
 * cambia el detector, los dos barridos dejan de ser comparables. */
const FORMA = /^>+\s*(?:⚠+\s*)?\*\*([A-ZÁÉÍÓÚÑ][^*]{25,200})\*\*/;

const candidatos = [];
for (const a of ALCANCE) {
  if (!existsSync(a.fichero)) { candidatos.push({ fichero: a.fichero, error: "no existe" }); continue; }
  let txt = readFileSync(a.fichero, "utf8");
  if (a.desde) { const m = txt.match(a.desde); txt = m ? txt.slice(m.index) : txt; }
  for (const l of txt.split(/\r?\n/)) {
    const m = l.match(FORMA);
    if (!m) continue;
    const enunciado = m[1].replace(/\s+/g, " ").trim();
    const palabras = enunciado.toLowerCase().replace(/[^\wáéíóúñ\s]/g, " ").split(/\s+/).filter((w) => w.length >= 6);
    const firma = palabras.slice(0, 6);
    const enClaude = firma.length >= 3 && firma.filter((w) => CLAUDE.toLowerCase().includes(w)).length >= Math.ceil(firma.length * 0.8);
    const tieneFecha = /20\d\d-\d\d-\d\d|\d+\.ª/.test(enunciado);
    candidatos.push({ fichero: a.fichero, enunciado: enunciado.slice(0, 160), tieneFecha, enClaude });
  }
}

const vivos = candidatos.filter((c) => !c.error);
const posiblesReglas = vivos.filter((c) => !c.enClaude && !c.tieneFecha);

const controles = [];
controles.push({ nombre: "el barrido alcanzó su ámbito (encontró enunciados con la forma)", ok: vivos.length > 0, visto: `${vivos.length} enunciados destacados en ${ALCANCE.length} ficheros` });
/* ⚠ si TODOS salieran «no están en CLAUDE», el cruce no estaría cruzando
 * (§*un patrón que casa en TODAS tampoco mide nada*). */
controles.push({ nombre: "el cruce contra CLAUDE.md DISCRIMINA", ok: vivos.some((c) => c.enClaude) && vivos.some((c) => !c.enClaude), visto: `ya en CLAUDE ${vivos.filter((c) => c.enClaude).length} · no ${vivos.filter((c) => !c.enClaude).length}` });
const nulo = controles.some((c) => !c.ok);

const salida = {
  meta: {
    tanda: "126.ª · CIERRE — barrido §regla 12",
    fecha: new Date().toISOString().slice(0, 10),
    alcance: ALCANCE.map((a) => `${a.fichero} (${a.razon})`),
    noContesta: [
      "el archivo entero: el barrido es ACOTADO por diseño, y eso es una limitación declarada, no un descuido",
      "los enunciados que esta tanda escribió en MENSAJES DE COMMIT y no en un documento: no los alcanza este detector",
    ],
  },
  controles,
  cardinales: {
    enunciadosDestacados: vivos.length,
    yaEnClaudeMd: vivos.filter((c) => c.enClaude).length,
    conFechaOTanda_eventos: vivos.filter((c) => c.tieneFecha && !c.enClaude).length,
    candidatosARegla: posiblesReglas.length,
  },
  candidatosARegla: posiblesReglas.map((c) => ({ fichero: c.fichero, enunciado: c.enunciado })),
  veredicto: nulo ? "NULA — control en rojo" : "valida",
};
writeFileSync("docs/research/cola-larga/derivaciones/regla12-barrido-126.json", JSON.stringify(salida, null, 2) + "\n", "utf8");

const L = [];
const say = (s) => { L.push(s); console.log(s); };
say("=== CONTROLES ===");
for (const c of controles) say(`  ${c.ok ? "OK " : "RED"} ${c.nombre}\n      ${c.visto}`);
say("");
say("=== CARDINALES (se escriben AUNQUE SEAN CERO) ===");
for (const [k, v] of Object.entries(salida.cardinales)) say(`  ${String(v).padStart(4)}  ${k}`);
say("");
say("=== CANDIDATOS A REGLA (sin fecha, no cruzados en CLAUDE.md) ===");
if (!posiblesReglas.length) say("  ninguno — y eso es el resultado, no la ausencia de barrido");
for (const c of posiblesReglas) say(`  ${c.fichero}\n    ${c.enunciado}`);
say("");
say(`VEREDICTO: ${salida.veredicto}`);
writeFileSync("docs/research/cola-larga/derivaciones/regla12-barrido-126.log", L.join("\n") + "\n", "utf8");
process.exit(nulo ? 1 : 0);
