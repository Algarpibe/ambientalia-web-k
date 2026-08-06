/**
 * TEST EN NEGATIVO de `cms-lectura` — cada sabotaje por SU invariante, **y con
 * control**.
 * Uso: npm run cms:reset && npm run qa:cms-lectura-neg
 *
 * ── Lo que hay que ejercitar, y por qué ───────────────────────────────────
 * `cms-lectura` afirma que el camino del RENDER proyecta lo mismo que el camino
 * verificado. Es una afirmación de IGUALDAD, o sea la que más fácil sale verde
 * por accidente: dos caminos que no miran nada coinciden perfectamente.
 *
 * | sabotaje | qué invariante ejercita |
 * |---|---|
 * | `sin-ruta-origen` | **CMS-0g mismo.** Sin el campo, `rutaDeMedia` cae al `/api/media/file/…` y el HTML cambia. Sin este caso, el 63/63 no distinguiría «el campo funciona» de «el campo no hacía falta» |
 * | `sin-declaraciones` | las tres declaraciones de la vuelta. Sin ellas la relación embebida vuelve como slug y el `kind` se pierde |
 * | `sin-documentos` | la regla del cero: 0 diferencias sobre 0 documentos tiene que caer por el CONTRATO |
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const casos = [
  {
    sabotaje: "sin-ruta-origen",
    exit: 2,
    porQue: "sin `rutaOrigen` el render devuelve /api/media/file/… en vez de /images/… — CMS-0g en negativo",
    comprueba: (d) =>
      d.veredicto?.distintos > 0 && d.diferencias?.some((x) => x.render.includes("/api/media/file/"))
        ? null
        : `esperaba diferencias con /api/media/file/; salió ${d.veredicto?.distintos} distintos`,
  },
  {
    sabotaje: "sin-declaraciones",
    exit: 2,
    porQue: "sin las declaraciones de `custom` la vuelta pierde el término embebido y el `kind`",
    comprueba: (d) =>
      d.veredicto?.distintos > 0 ? null : `esperaba diferencias; salió ${d.veredicto?.distintos}`,
  },
  {
    sabotaje: "sin-documentos",
    exit: 2,
    porQue: "0 comparados ⇒ cae por el CONTRATO, nunca por «0 diferencias» (regla 4)",
    comprueba: (d) =>
      d.contrato?.suficiente === false && d.veredicto?.comparados === 0 && d.veredicto?.distintos === 0
        ? null
        : `esperaba contrato insuficiente con 0 comparados y 0 distintos; salió ${d.contrato?.suficiente} / ${d.veredicto?.comparados} / ${d.veredicto?.distintos}`,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · cms-lectura ════════\n`);
console.log(`  ${casos.length} sabotajes contra el camino de lectura del render + control\n`);

const ev = new Evaluadas({ nombre: "cms-lectura-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;
const corre = (etiqueta, env = {}) =>
  corridaNegativa({ etiqueta, args: [join(QA, "cms-lectura.mjs")], env, timeout: 900_000 });
const fich = (e) => join(QA, nombreNeg("medidas/cms-lectura.json", e));
const lee = (e) => (existsSync(fich(e)) ? JSON.parse(readFileSync(fich(e), "utf8")) : null);
const borra = (e) => { if (existsSync(fich(e))) rmSync(fich(e)); };

borra("control");
const t0 = Date.now();
const ctl = corre("control", { SABOTAJE: "control" });
const segCtl = ((Date.now() - t0) / 1000).toFixed(0);
const dCtl = lee("control");
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!dCtl) malCtl = "no congeló su medida";
else if (dCtl.veredicto?.ok !== true) malCtl = "veredicto.ok ≠ true";
else if (!(dCtl.veredicto?.comparados > 0)) malCtl = "0 comparados: no habría mirado nada";
if (malCtl) { fallos++; console.log(`  ❌ CONTROL      (sin sabotaje)  (${segCtl}s)  ${malCtl}`); }
else console.log(`  ✓  CONTROL      (sin sabotaje)  (${segCtl}s)  exit 0 · ${dCtl.veredicto.comparados} documentos · 0 distintos`);

for (const c of casos) {
  borra(c.sabotaje);
  const t = Date.now();
  const res = corre(c.sabotaje, { SABOTAJE: c.sabotaje });
  const seg = ((Date.now() - t) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(c.sabotaje, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.comprueba) {
    const d = lee(c.sabotaje);
    mal = d ? c.comprueba(d, dCtl ?? {}) : "no congeló su artefacto";
  }
  if (mal) { fallos++; console.log(`  ❌ SABOTAJE=${c.sabotaje.padEnd(18)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  SABOTAJE=${c.sabotaje.padEnd(18)} (${seg}s)  ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} cms-lectura · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}` +
    `  (${casos.length} sabotajes · control)\n` +
    (fallos === 0
      ? `   El camino del render se acusa cuando pierde la procedencia, cuando pierde las\n` +
        `   declaraciones y cuando no lee nada. El 63/63 ya se puede citar para él.\n`
      : `   Hasta que esto salga verde, el 63/63 de cms-lectura es un verde prestado.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
