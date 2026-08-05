/**
 * TEST EN NEGATIVO del eje `existencia` — cada sabotaje por SU invariante.
 * Uso: npm run qa:artefacto-neg
 *
 * Este eje nació **de dos verdes falsos**: las 23 imágenes 404 y los
 * `imageSizes` inertes vivieron en verde porque nadie miraba el disco. Un eje
 * que nace así **no puede estrenarse sin probar que sabe ponerse rojo**, y tiene
 * tres invariantes independientes, así que hacen falta tres dianas distintas:
 *
 *   · `fichero-ausente`      → **A**: el clon sirve algo que no está en disco;
 *   · `sha-cambiado`         → **B**: una congelada que cambia bajo los pies;
 *   · `variante-no-generada` → **C**: la ficha declara un tamaño sin fichero.
 *     **Es el defecto de los `imageSizes` inertes**, el que costó dos tandas;
 *   · `dimension-distinta`   → **C**: el fichero existe y **no mide lo que su
 *     ficha dice**. Separado del anterior a propósito: «existe» y «mide lo que
 *     dice» son dos propiedades, y una sonda que sólo comprobara la primera
 *     daría verde sobre un recorte equivocado;
 *   · `sin-fuente`           → la regla del cero: con las listas vacías,
 *     «nada roto» y «no se ha mirado nada» dan la misma salida.
 *
 * Y el **CONTROL**: con la deuda FICHADA de §M-404 delante, el eje **NO** sale
 * rojo. Es la mitad que hace utilizable el eje — *un rojo permanente por deuda
 * ajena es cómo se consigue que nadie lea los rojos*— y a la vez la que prueba
 * que la lista de fichadas no se está tragando defectos nuevos: el sabotaje
 * `fichero-ausente` mete una ausencia que **no** está fichada y tiene que morder.
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const casos = [
  {
    sabotaje: "fichero-ausente",
    exit: 2,
    porQue: "A · una referencia servida sin fichero y NO fichada ⇒ el clon sirve algo que no existe",
    salidaTiene: /referencia\(s\) servida\(s\) SIN FICHERO/,
    comprueba: (d) => (d.servido?.ausentesNuevas?.length > 0 ? null : "esperaba ausentes NUEVAS > 0"),
  },
  {
    sabotaje: "sha-cambiado",
    exit: 2,
    porQue: "B · el sha256 de un capturado no casa ⇒ la línea base cambió bajo los pies",
    salidaTiene: /sha256 NO casa/,
  },
  {
    sabotaje: "variante-no-generada",
    exit: 2,
    porQue: "C · la ficha declara un tamaño cuyo fichero no está — EL defecto de los `imageSizes` inertes",
    salidaTiene: /tama[ñn]o\(s\) que la ficha declara y cuyo fichero NO est[áa]/,
    comprueba: (d) => (d.cms?.varianteAusente?.length > 0 ? null : "esperaba varianteAusente > 0"),
  },
  {
    sabotaje: "dimension-distinta",
    exit: 2,
    porQue: "C · el fichero existe y NO mide lo que su ficha dice — «existe» y «mide» son dos propiedades",
    salidaTiene: /NO miden lo que su ficha dice/,
    comprueba: (d) => (d.cms?.dimensionDistinta?.length > 0 ? null : "esperaba dimensionDistinta > 0"),
  },
  {
    sabotaje: "sin-fuente",
    exit: 2,
    porQue: "las listas vacías ⇒ SIN UNIDADES, nunca «nada roto» (regla del cero)",
    salidaTiene: /SIN UNIDADES|NO SE PUDO EVALUAR/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · eje \`existencia\` ════════\n`);
console.log(`  ${casos.length} sabotajes, uno por invariante (A · B · C×2 · el cero) + control\n`);

const ev = new Evaluadas({ nombre: "artefacto-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;
const corre = (etiqueta, env = {}) => corridaNegativa({ etiqueta, args: [join(QA, "artefacto.mjs")], env, timeout: 900_000 });
const fich = (e) => join(QA, nombreNeg("medidas/artefacto.json", e));
const lee = (e) => (existsSync(fich(e)) ? JSON.parse(readFileSync(fich(e), "utf8")) : null);
const borra = (e) => { if (existsSync(fich(e))) rmSync(fich(e)); };

for (const c of casos) {
  borra(c.sabotaje);
  const t = Date.now();
  const res = corre(c.sabotaje, { SABOTAJE: c.sabotaje });
  const out = (res.stdout || "") + (res.stderr || "");
  const seg = ((Date.now() - t) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(c.sabotaje, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && c.comprueba) {
    const d = lee(c.sabotaje);
    mal = d ? c.comprueba(d) : "no congeló su artefacto";
  }
  if (mal) { fallos++; console.log(`  ❌ SABOTAJE=${c.sabotaje.padEnd(21)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  SABOTAJE=${c.sabotaje.padEnd(21)} (${seg}s)  ${c.porQue}`);
}

/* ── EL CONTROL ─────────────────────────────────────────────────────────── */
borra("control");
const t0 = Date.now();
const ctl = corre("control", { SABOTAJE: "control" });
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
const segCtl = ((Date.now() - t0) / 1000).toFixed(0);
let malCtl = null;
const dCtl = lee("control");
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — con SÓLO la deuda fichada, el eje NO puede salir rojo`;
else if (!dCtl) malCtl = "no congeló su medida";
else if (!(dCtl.servido?.ausentesFichadas > 0))
  malCtl =
    `ausentesFichadas = ${dCtl.servido?.ausentesFichadas}. Si no hubiera NINGUNA deuda fichada, el control ` +
    `no probaría que la lista de fichadas funciona: probaría que no hace falta`;
else if (dCtl.servido?.ausentesNuevas?.length) malCtl = `hay ${dCtl.servido.ausentesNuevas.length} ausencia(s) NUEVA(S): eso es un defecto real, no un control limpio`;
else if (!/✅/.test(ctlOut)) malCtl = "sin la línea del veredicto verde";
if (malCtl) { fallos++; console.log(`  ❌ CONTROL      (sin sabotaje)  (${segCtl}s)  ${malCtl}`); }
else console.log(`  ✓  CONTROL      (sin sabotaje)  (${segCtl}s)  exit 0 con ${dCtl.servido.ausentesFichadas} ausencias FICHADAS delante · 0 nuevas`);

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} eje \`existencia\` · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}` +
    `  (${casos.length} que cazan · control)\n` +
    (fallos === 0
      ? `   El eje se pone rojo por los TRES invariantes por separado —el fichero que no\n` +
        `   está, la congelada que cambia, la variante que no se generó y la que no mide\n` +
        `   lo que dice— y NO se pone rojo por la deuda fichada. Ya se puede citar.\n`
      : `   El eje NO se puede citar hasta que esto salga verde: nació de dos verdes\n` +
        `   falsos, y un eje que no sabe ponerse rojo repetiría el que lo creó.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
