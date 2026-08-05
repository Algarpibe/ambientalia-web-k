/**
 * TEST EN NEGATIVO de `media-poblaciones` — cada sabotaje por SU invariante,
 * **y con control**. Uso: npm run qa:media-poblaciones-neg
 *
 * El reparto que produce esta sonda decide QUÉ se migra y CON QUÉ restricción.
 * Las tres formas de que ese reparto sea vacuo sin dar error son distintas y se
 * atacan por separado:
 *
 *   · `selector-muerto` — si el patrón de referencias no casara, la sonda
 *     mediría **0 servido** y eso se lee como «no hay media que migrar», que es
 *     justo la conclusión contraria a la verdadera (regla 4, el cero);
 *   · `sin-fichero` — la guarda de «servido y ausente» tiene que **encontrar**
 *     un fichero escondido. Si no lo encontrara, los 404 reales tampoco
 *     saldrían. Como esa cuenta NO cierra el código a propósito, el sabotaje se
 *     verifica sobre el ARTEFACTO (la lista tiene que crecer con el escondido),
 *     no sobre el exit — que es la única forma honesta de probarlo;
 *   · `sin-corpus` — sin el lado (b) el reparto no compara nada y sale ✅ con
 *     todo a cero. Tiene que salir ROJO (regla 4bis: «0 comparado = verde»).
 *
 * Y el **CONTROL**: sin sabotaje, exit 0, las dos poblaciones con contenido y
 * el escondido del sabotaje ausente de la lista de rotas — que es lo que prueba
 * que `sin-fichero` movió algo y no que la lista ya lo traía.
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const casos = [
  {
    sabotaje: "selector-muerto",
    exit: 2,
    porQue: "prefijo que no existe ⇒ 0 servido sale por ERROR, nunca como «nada que migrar»",
    salidaTiene: /PATRÓN MUERTO/,
  },
  {
    sabotaje: "sin-corpus",
    exit: 2,
    porQue: "sin el lado (b) el reparto no compara nada ⇒ SOLAPE 0 es rojo, no verde",
    salidaTiene: /SOLAPE 0/,
  },
  {
    sabotaje: "sin-fichero",
    exit: 0, // los 404 NO cierran el código: la aserción va sobre el artefacto
    porQue: "un fichero escondido aparece en la lista de servido-sin-fichero",
    comprueba: (d, ctl) => {
      const esc = d.meta?.escondido;
      if (!esc) return "el sabotaje no declaró qué escondió";
      const rotas = new Set(d.servida?.sinFicheroEnDisco ?? []);
      if (!rotas.has(esc)) return `escondió ${esc} y la guarda NO lo encontró`;
      if (new Set(ctl.servida?.sinFicheroEnDisco ?? []).has(esc))
        return `${esc} ya salía roto en el control: el sabotaje no prueba nada`;
      if (rotas.size !== (ctl.servida?.sinFicheroEnDisco?.length ?? -1) + 1)
        return `la lista pasó de ${ctl.servida?.sinFicheroEnDisco?.length} a ${rotas.size}: esperaba exactamente una más`;
      return null;
    },
  },
];

console.log(`\n════════ TEST EN NEGATIVO · media-poblaciones ════════`);
console.log(`  cada corrida levanta su propio clon en un puerto libre\n`);

const ev = new Evaluadas({ nombre: "media-poblaciones-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;

const corre = (etiqueta, env = {}) =>
  corridaNegativa({ etiqueta, args: [join(QA, "media-poblaciones.mjs")], env, timeout: 900_000 });
const rutaArt = (etiqueta) => join(QA, nombreNeg("medidas/media-poblaciones.json", etiqueta));
const lee = (etiqueta) => (existsSync(rutaArt(etiqueta)) ? JSON.parse(readFileSync(rutaArt(etiqueta), "utf8")) : null);
const borra = (etiqueta) => { if (existsSync(rutaArt(etiqueta))) rmSync(rutaArt(etiqueta)); };

/* ── EL CONTROL VA PRIMERO ────────────────────────────────────────────────
 * `sin-fichero` se juzga CONTRA él (¿la lista creció en exactamente uno?), así
 * que sin control no hay con qué comparar. Es la lección de F2-1 §5 en su forma
 * más literal: el control no es la mitad opcional, es la que da significado. */
borra("control");
let t0 = Date.now();
const ctl = corre("control", { SABOTAJE: "control" });
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
let seg = ((Date.now() - t0) / 1000).toFixed(0);
const dCtl = lee("control");
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!dCtl) malCtl = "no congeló su medida";
else if (!(dCtl.servida?.referencias > 0)) malCtl = "0 referencias servidas";
else if (!(dCtl.corpus?.solape > 0)) malCtl = "solape 0";
else if (!/LAS DOS POBLACIONES DE MEDIA/.test(ctlOut)) malCtl = "sin la cabecera del reparto";
if (malCtl) { fallos++; console.log(`  ❌ CONTROL         (sin sabotaje) (${seg}s)  ${malCtl}`); }
else
  console.log(
    `  ✓  CONTROL         (sin sabotaje) (${seg}s)  exit 0 · servida ${dCtl.servida.referencias} · ` +
      `solape ${dCtl.corpus.solape} · sólo corpus ${dCtl.corpus.soloCorpus}`,
  );

for (const c of casos) {
  borra(c.sabotaje);
  t0 = Date.now();
  const res = corre(c.sabotaje, { SABOTAJE: c.sabotaje });
  const out = (res.stdout || "") + (res.stderr || "");
  seg = ((Date.now() - t0) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(c.sabotaje, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && c.comprueba) {
    const d = lee(c.sabotaje);
    mal = d ? (dCtl ? c.comprueba(d, dCtl) : "sin control con el que comparar") : "no congeló su artefacto";
  }
  if (mal) { fallos++; console.log(`  ❌ SABOTAJE=${c.sabotaje.padEnd(15)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  SABOTAJE=${c.sabotaje.padEnd(15)} (${seg}s)  ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} media-poblaciones · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   La sonda sabe gritar cuando su patrón no casa y cuando no hay con qué\n` +
        `   comparar, y su guarda de «servido y ausente» encuentra un fichero que se\n` +
        `   esconde. El reparto de las dos poblaciones ya se puede citar.\n`
      : `   El reparto NO se puede citar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
