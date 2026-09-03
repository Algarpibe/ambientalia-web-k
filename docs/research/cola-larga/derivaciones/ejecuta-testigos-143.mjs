/**
 * 143.ª · ESCALÓN 3 — LOS DOS TESTIGOS DE `ejecuta()` DE `qa/publicar.mjs`
 * ══════════════════════════════════════════════════════════════════════
 *
 * §regla 28e: **la verificación de un arreglo se toma donde el CASO existe, no
 * donde el código corre.** `ejecuta()` sólo se llama para
 * `docker stop/start kunak-cms-pg`, y hoy eso devuelve 0 — así que la rama
 * nueva **no se ejercita ahí** y un control atado a esa corrida no distinguiría
 * *«la rama funciona»* de *«la rama está muerta»*.
 *
 * Los dos testigos, uno por POLARIDAD (§regla 28d), sobre la función **cortada
 * del fuente por ESTRUCTURA** —no reescrita a mano, o el testigo mediría otra
 * función—:
 *
 *   T-NO-OP · `docker start kunak-cms-pg` → codigo 0 ⇒ la rama nueva NO fira.
 *             Es la prueba de que el arreglo no toca lo que no debe.
 *   T-GRITA · `docker start <contenedor-inventado>` → codigo ≠ 0 ⇒ la rama
 *             fira y el aviso sale. Es la prueba de que sabe ver el caso.
 *
 * Sin T-GRITA, un `ejecuta()` con la rama muerta pasaría T-NO-OP igual.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const SONDA = path.join(RAIZ, "scripts/qa/publicar.mjs");

/* ── se CORTA la función del fuente casando llaves, no se transcribe ─────── */
const src = fs.readFileSync(SONDA, "utf8");
const ini = src.indexOf("function ejecuta(cmd, args) {");
if (ini < 0) throw new Error("no encuentro `function ejecuta` en publicar.mjs — ¿se renombró?");
let i = src.indexOf("{", ini), prof = 0, fin = -1;
for (; i < src.length; i++) {
  if (src[i] === "{") prof++;
  else if (src[i] === "}") { prof--; if (prof === 0) { fin = i + 1; break; } }
}
const cuerpo = src.slice(ini, fin);
console.log(`── \`ejecuta()\` cortada del fuente por estructura: ${cuerpo.length} chars ──`);
/* control del corte: tiene que traer las dos piezas del arreglo */
const cortaBien = /stdio: \["ignore", "pipe", "pipe"\]/.test(cuerpo) && /codigo !== 0/.test(cuerpo);
if (!cortaBien) throw new Error("el corte no trae las dos piezas del arreglo: el testigo mediría otra función");

/* ── se instancia la función cortada, capturando lo que imprime ─────────── */
const impreso = [];
const consolaFalsa = { log: (...xs) => impreso.push(xs.join(" ")) };
// eslint-disable-next-line no-new-func
const ejecuta = new Function("spawn", "console", `${cuerpo}; return ejecuta;`)(spawn, consolaFalsa);

const casos = [
  { etiqueta: "T-NO-OP", args: ["start", "kunak-cms-pg"], esperaCodigo: 0, esperaAviso: false },
  { etiqueta: "T-GRITA", args: ["start", "no-existe-este-contenedor-143"], esperaCodigo: "≠0", esperaAviso: true },
];

const resultados = [];
for (const c of casos) {
  impreso.length = 0;
  const codigo = await ejecuta("docker", c.args);
  const aviso = impreso.some((l) => /FALLÓ con codigo/.test(l));
  const okCodigo = c.esperaCodigo === 0 ? codigo === 0 : codigo !== 0;
  const ok = okCodigo && aviso === c.esperaAviso;
  resultados.push({ ...c, codigo, aviso, ok, lineas: impreso.slice() });
  console.log(`  ${ok ? "✓" : "✗"} ${c.etiqueta} · docker ${c.args.join(" ")} → codigo ${codigo} · aviso ${aviso}`);
  if (impreso.length) console.log(impreso.join("\n"));
}

const vale = resultados.every((r) => r.ok);
const salida = {
  fecha: new Date().toISOString(),
  que: "los dos testigos de ejecuta() de qa/publicar.mjs, tomados donde el caso existe (§regla 28e)",
  cortadaDelFuente: { chars: cuerpo.length, traeLasDosPiezas: cortaBien },
  resultados,
  vale,
};
const dest = path.join(path.dirname(fileURLToPath(import.meta.url)), "ejecuta-testigos-143.json");
fs.writeFileSync(dest, JSON.stringify(salida, null, 2));
console.log(`\n${vale ? "✅ LOS DOS TESTIGOS PASAN" : "⛔ ALGÚN TESTIGO NO PASA"} — congelado en ${path.relative(RAIZ, dest).replace(/\\/g, "/")}`);
process.exitCode = vale ? 0 : 1;
