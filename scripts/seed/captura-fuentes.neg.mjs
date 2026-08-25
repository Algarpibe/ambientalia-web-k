/**
 * TEST EN NEGATIVO de `cms:captura-fuentes`.
 * Uso: npm run cms:captura-fuentes-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠ **ALCANCE, declarado: este negativo NO SALE A LA RED.** Ejercita las
 * guardas del INVENTARIO y del DESVÍO DE SALIDA, que es donde este script
 * puede fabricar un verde. La rama de descarga **no se ejercita**, y decirlo
 * importa: un negativo que no cubre una rama y no lo dice se lee como si la
 * cubriera (§regla 10 — la completitud se declara respecto a un uso).
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | `corpus-sin-hojas` | **TIRA**: 0 hojas ⇒ el canal 1 saldría a cero sin mirarse | inventariar sólo el canal 2 y llamarlo inventario |
 * | `sabotaje-sin-neg` | **TIRA**: un sabotaje sin `NEG=` dejaría el índice CANÓNICO con contenido de control | desviar sólo si quien lanza se acuerda |
 * | `sabotaje-desconocido` | **TIRA** nombrando los que hay | aceptarlo y no sabotear nada |
 * | (control) | ✅ `SOLO_DERIVA`: **4 familias por LOS DOS canales**, 0 peticiones | — |
 *
 * **El control es el caso que discrimina**, y no por su código de salida
 * (§regla 21, la vuelta): exige que el inventario nombre **los dos canales**.
 * Mirar sólo el `@import` de las hojas capturadas daría **1 familia** en vez de
 * 4 — las otras 3 viven en `<style>` en línea— y ese 1 se leería como dato.
 * ═════════════════════════════════════════════════════════════════════════ */
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, QA } from "../qa/lib.mjs";

const SONDA = join(QA, "../seed/captura-fuentes.mjs");

/**
 * ⚠⚠ **`sabotaje-sin-neg` NO puede lanzarse por `corridaNegativa`, y ésa es
 * exactamente la razón de que exista.**
 *
 * `corridaNegativa` **pone `NEG` ella misma** —es su trabajo, y está bien—.
 * Así que un caso que pregunta *«¿qué pasa si falta `NEG`?»* lanzado por ella
 * tiene **0 instancias separadoras POR CONSTRUCCIÓN**: el corredor suministra
 * justo la variable que la guarda comprueba (§regla 17 — *un sabotaje que
 * comparte variable con lo que ejercita mueve la portería*).
 *
 * Medido: por `corridaNegativa` el caso salía **exit 0 tras 6 segundos**, o
 * sea corriendo la campaña entera. Lo que la guarda protege es el camino
 * DIRECTO —`SABOTAJE=x node scripts/seed/captura-fuentes.mjs`—, así que se
 * ejercita por ahí, con `NEG` explícitamente BORRADO del entorno del hijo.
 */
function corridaCruda({ env }) {
  const hijo = { ...process.env, ...env };
  delete hijo.NEG;
  delete hijo.PISAR;
  delete hijo.SALIDA;
  return spawnSync(process.execPath, [SONDA], { env: hijo, encoding: "utf8", timeout: 120_000 });
}

const casos = [
  {
    etiqueta: "control",
    porQue: "SOLO_DERIVA: inventaría por los DOS canales y no pide un solo fichero",
    env: { SOLO_DERIVA: "1" },
    exit: 0,
    salidaTiene: /familias distintas\s+\d+/,
    ademas: (out) => {
      const m = out.match(/familias distintas\s+(\d+)/);
      const n = Number(m?.[1] ?? 0);
      if (n < 2) return `inventarió ${n} familias: con menos de 2 no se puede afirmar que mire los dos canales`;
      if (!/hoja \d+/.test(out)) return "el canal `hoja` no sale nombrado: el @import de corpus/css no se está mirando";
      if (!/style-en-linea \d+/.test(out)) return "el canal `style-en-linea` no sale nombrado: los <style> del HTML no se están mirando";
      if (/✓ \d+\/\d+ /.test(out)) return "pidió ficheros en modo SOLO_DERIVA";
      return null;
    },
  },
  {
    etiqueta: "corpus-sin-hojas",
    porQue: "0 hojas en corpus/css ⇒ TIRA, en vez de publicar el canal 1 a cero sin haberlo mirado",
    env: { SOLO_DERIVA: "1", CORPUS_CSS_VACIO: "1" },
    exit: 1,
    salidaTiene: /0 hojas en `corpus\/css`/,
  },
  {
    etiqueta: "sabotaje-sin-neg",
    porQue: "SABOTAJE sin NEG= ⇒ TIRA: si no, el árbol canónico quedaría con contenido de control (§regla 7/24)",
    crudo: true,   /* ← ver `corridaCruda`: por `corridaNegativa` no discrimina */
    env: { SABOTAJE: "css-vacio" },
    exit: 1,
    salidaTiene: /sin NEG=/,
  },
  {
    etiqueta: "sabotaje-desconocido",
    porQue: "un nombre de sabotaje que no existe ⇒ TIRA nombrando los que hay, en vez de correr sin sabotear",
    env: { SABOTAJE: "no-existe-este-sabotaje", NEG: "x" },
    exit: 1,
    salidaTiene: /SABOTAJE desconocido/,
  },
];

console.log("\n════════ TEST EN NEGATIVO · captura-fuentes ════════");
console.log("  alcance: las guardas del INVENTARIO y del DESVÍO · SIN RED (la descarga no se ejercita)\n");

const ev = new Evaluadas({ nombre: "captura-fuentes-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const t0 = Date.now();
  const res = c.crudo
    ? corridaCruda({ env: c.env })
    : corridaNegativa({ etiqueta: c.etiqueta, args: [SONDA], env: c.env, timeout: 120_000 });
  const out = (res.stdout || "") + (res.stderr || "");
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (c.exit !== undefined && res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && c.ademas) mal = c.ademas(out);

  if (mal) { fallos++; console.log(`  ❌ ${c.etiqueta.padEnd(22)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  ${c.etiqueta.padEnd(22)} (${seg}s)  cayó por lo suyo: ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} captura-fuentes · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
  (fallos === 0
    ? "   Un inventario que mira UN canal de dos no es un inventario: es ese canal.\n"
    : "   No se puede correr la campaña hasta que esto salga verde.\n"),
);
process.exit(fallos === 0 ? 0 : 2);
