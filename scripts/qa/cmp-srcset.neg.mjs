/**
 * TEST EN NEGATIVO de `cmp-srcset` — cada sabotaje por SU invariante, con
 * control. Uso: npm run qa:cmp-srcset-neg
 *
 * `cmp-srcset` estrena un EJE, y un eje nuevo llega sin cobertura: su primer
 * veredicto es «70 pares donde el clon no emite el `srcset` del original», que
 * es un número que va a citarse. Las tres formas de que ese número sea basura:
 *
 *   · `selector-muerto` — si las `<img>` se buscaran por una etiqueta que no
 *     existe, la sonda compararía **0 pares** y saldría diciendo que no hay
 *     diferencias. Tiene que salir por ERROR (regla 4, el cero);
 *   · `sin-normalizar` — si no se plegara el host del original contra el
 *     prefijo del clon, **el 100 %** saldría distinto. Ésa es la trampa que ya
 *     mordió una vez en este repo (`c-cmp`: «31 de 31 rutas distintas»), y la
 *     sonda tiene que ACUSARSE con la guarda del PLENO en vez de publicar el
 *     hallazgo;
 *   · `sin-pares` — si el emparejamiento se rompiera, todo saldría «sin pareja»
 *     y **eso no cuenta como defecto** en esta sonda, así que el exit podría
 *     seguir siendo 0 por el camino equivocado. Se exige que el contador de
 *     comparados con veredicto real caiga a 0 y que salga rojo.
 *
 * Y el **CONTROL**: sin sabotaje, la sonda mide 311 de 311 pares, empareja de
 * verdad (más de la mitad IGUAL) y su rojo es el del criterio de M-IMG, no un
 * fallo de instrumento.
 *
 * ⚠ El control de esta sonda sale con **exit 2 a propósito**, y por eso se
 * comprueba distinto: su rojo ES el hallazgo —el criterio del PLAN dice que el
 * `srcset` tiene que coincidir y no coincide—. Un control que exigiera exit 0
 * sería exigirle a la sonda que no encuentre lo que ha encontrado.
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const casos = [
  {
    sabotaje: "selector-muerto",
    porQue: "etiqueta que no existe ⇒ 0 pares sale por ERROR, nunca como «todo coincide»",
    salidaTiene: /0 PARES COMPARADOS|NO SE PUDO EVALUAR/,
    exit: 2,
  },
  {
    sabotaje: "sin-normalizar",
    porQue: "sin plegar host contra prefijo el 100 % sale distinto ⇒ la guarda del PLENO se acusa",
    salidaTiene: /PLENO/,
    exit: 2,
    comprueba: (d) => {
      const v = d.veredictos;
      const total = Object.values(v).reduce((a, b) => a + b, 0);
      return v.igual === 0 && total > 0 ? null : `esperaba 0 iguales de ${total}; salieron ${v.igual}`;
    },
  },
  {
    sabotaje: "sin-pares",
    porQue: "emparejamiento roto ⇒ todo «sin pareja» y NINGÚN par con veredicto real",
    exit: 2,
    comprueba: (d) => {
      const v = d.veredictos;
      const reales = v.igual + v.clonSinSrcset + v.distinto + v.originalSinSrcset;
      return reales === 0 && v.sinPareja > 0
        ? null
        : `esperaba 0 pares con veredicto real y todo sin pareja; salió ${reales} reales / ${v.sinPareja} sin pareja`;
    },
  },
];

console.log(`\n════════ TEST EN NEGATIVO · cmp-srcset ════════`);
console.log(`  cada corrida levanta su propio clon en un puerto libre\n`);

const ev = new Evaluadas({ nombre: "cmp-srcset-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;

const corre = (etiqueta, env = {}) =>
  corridaNegativa({ etiqueta, args: [join(QA, "cmp-srcset.mjs")], env, timeout: 900_000 });
const ruta = (etiqueta) => join(QA, nombreNeg("medidas/cmp-srcset.json", etiqueta));
const lee = (etiqueta) => (existsSync(ruta(etiqueta)) ? JSON.parse(readFileSync(ruta(etiqueta), "utf8")) : null);
const borra = (etiqueta) => { if (existsSync(ruta(etiqueta))) rmSync(ruta(etiqueta)); };

for (const c of casos) {
  borra(c.sabotaje);
  const t0 = Date.now();
  const res = corre(c.sabotaje, { SABOTAJE: c.sabotaje });
  const out = (res.stdout || "") + (res.stderr || "");
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(c.sabotaje, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && c.comprueba) {
    const d = lee(c.sabotaje);
    mal = d ? c.comprueba(d) : "no congeló su artefacto";
  }
  if (mal) { fallos++; console.log(`  ❌ SABOTAJE=${c.sabotaje.padEnd(15)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  SABOTAJE=${c.sabotaje.padEnd(15)} (${seg}s)  ${c.porQue}`);
}

/* ── EL CONTROL ─────────────────────────────────────────────────────────── */
borra("control");
const t0 = Date.now();
const ctl = corre("control", { SABOTAJE: "control" });
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
const seg = ((Date.now() - t0) / 1000).toFixed(0);
const d = lee("control");
let malCtl = null;
if (!d) malCtl = "no congeló su medida";
else {
  const v = d.veredictos;
  const total = Object.values(v).reduce((a, b) => a + b, 0);
  if (total !== d.meta.alcance.imagenes) malCtl = `comparó ${total} de ${d.meta.alcance.imagenes} pares`;
  else if (v.igual === 0) malCtl = "0 pares IGUALES — el emparejamiento no está funcionando";
  else if (/PLENO/.test(ctlOut)) malCtl = "la guarda del PLENO se disparó sin sabotaje";
  else if (v.clonSinSrcset + v.distinto === 0 && ctl.status !== 0)
    malCtl = `sin diferencias pero exit ${ctl.status}`;
  else if (v.clonSinSrcset + v.distinto > 0 && ctl.status !== 2)
    malCtl = `${v.clonSinSrcset + v.distinto} diferencias y exit ${ctl.status} — el rojo del criterio no cierra el código`;
  else if (!d.meta.alcance.rutasDelBuildFuera?.length)
    malCtl = "el alcance no declara las rutas del build que quedan fuera — el verde parecería cubrirlas";
}
if (malCtl) { fallos++; console.log(`  ❌ CONTROL         (sin sabotaje) (${seg}s)  ${malCtl}`); }
else {
  const v = d.veredictos;
  console.log(
    `  ✓  CONTROL         (sin sabotaje) (${seg}s)  ${v.igual} iguales · ${v.clonSinSrcset} sin srcset · ` +
      `${v.distinto} distintos · alcance declarado (${d.meta.alcance.rutasDelBuildFuera.length} rutas fuera)`,
  );
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} cmp-srcset · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   La sonda sabe gritar cuando su selector no casa, se ACUSA cuando lo\n` +
        `   encuentra todo distinto, y no cuenta un emparejamiento roto como verde.\n` +
        `   Sus números del eje \`srcset\` ya se pueden citar.\n`
      : `   El eje \`srcset\` NO se puede citar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
