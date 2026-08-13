/**
 * TEST EN NEGATIVO de `cms:captura-css`.
 * Uso: npm run qa:captura-css-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠ **ALCANCE, declarado: este negativo NO SALE A LA RED.** Prueba las guardas
 * de la LISTA —que es donde este script puede fabricar un verde— y no la rama
 * de descarga. Decirlo importa: un negativo que no ejercita una rama y no lo
 * dice se lee como si la cubriera (§regla 10 — se declara respecto a un uso).
 *
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | `sin-lista` | **TIRA** por no saber qué pedir | capturar las 505 «por defecto» |
 * | `pagina-ausente` | **TIRA** por una ruta que no existe | tratarla como 0 hojas |
 * | (control) | ✅ `SOLO_DERIVA`: 505 hojas inventariadas, 0 peticiones | — |
 *
 * **`sin-lista` es el que importa**, y es §regla 6 con nombre: si el script
 * eligiera un valor por defecto al faltarle el parámetro, «no me dijeron qué
 * capturar» se convertiría en «captúralo todo» — 505 peticiones al original
 * porque alguien olvidó un argumento.
 * ═════════════════════════════════════════════════════════════════════════ */
import { join } from "node:path";
import { corridaNegativa, Evaluadas, QA } from "../qa/lib.mjs";

const SONDA = join(QA, "../seed/captura-css.mjs");

const casos = [
  {
    etiqueta: "control",
    porQue: "SOLO_DERIVA: inventaría el corpus entero y no pide un solo fichero",
    env: { SOLO_DERIVA: "1" },
    args: [],
    exit: 0,
    salidaTiene: /hojas distintas\s+\d+/,
    ademas: (out) => {
      const m = out.match(/hojas distintas\s+(\d+)/);
      if (!m || Number(m[1]) < 100) return `inventarió ${m?.[1] ?? "?"} hojas: el barrido del corpus no está midiendo`;
      if (/A PEDIR\s+[1-9]/.test(out)) return "pidió ficheros en modo SOLO_DERIVA";
      return null;
    },
  },
  {
    etiqueta: "sin-lista",
    porQue: "sin --pagina y sin SOLO_DERIVA ⇒ TIRA, en vez de capturar las 505 por defecto",
    env: {},
    args: [],
    exit: 1,
    salidaTiene: /SIN LISTA/,
  },
  {
    etiqueta: "pagina-ausente",
    porQue: "una ruta de HTML que no existe ⇒ TIRA, en vez de leerla como 0 hojas",
    env: {},
    args: ["--pagina=corpus/casos/no-existe-esta-pagina.html"],
    exit: 1,
    salidaTiene: /PÁGINA AUSENTE/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · captura-css ════════`);
console.log(`  alcance: las guardas de la LISTA · SIN RED (la rama de descarga no se ejercita)\n`);

const ev = new Evaluadas({ nombre: "captura-css-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const t0 = Date.now();
  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [SONDA, ...c.args], env: c.env, timeout: 120_000 });
  const out = (res.stdout || "") + (res.stderr || "");
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (c.exit !== undefined && res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && c.ademas) mal = c.ademas(out);

  if (mal) {
    fallos++;
    console.log(`  ❌ ${c.etiqueta.padEnd(16)} (${seg}s)  ${mal}`);
  } else console.log(`  ✓  ${c.etiqueta.padEnd(16)} (${seg}s)  cayó por lo suyo: ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} captura-css · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   Una lista que no se nombra no se sustituye por «todo»: se rechaza.\n`
      : `   No se puede correr la campaña hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
