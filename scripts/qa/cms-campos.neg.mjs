/**
 * TEST EN NEGATIVO de `cms-campos` — entero, y **cada sabotaje cae por SU
 * invariante**, no por otro.
 *
 * Es la condición que `CLAUDE.md` §sondas pone antes de creerse un limpio: *una
 * sonda que no encuentra nada y una que no mira nada dan la misma salida*. Aquí
 * el riesgo es mayor de lo normal, porque el verde de `cms-campos` es lo que
 * autoriza a decir «las colecciones expresan lo medido» — si la comprobación no
 * sabe fallar, esa frase no vale nada.
 *
 * Los cuatro invariantes, y por qué hacen falta los cuatro:
 *
 *   · `campo` → **el principal**: se quita un campo REAL de una colección
 *     (`casos.cliente`) y tiene que salir nombrado. Es el sabotaje que el
 *     encargo pide literalmente: *quita un campo a propósito y la comprobación
 *     cae; ponlo y vuelve a pasar*.
 *   · `alias` → un alias que apunta a un campo de Payload inexistente. Sin esta
 *     guarda, **un alias podría tapar un hueco**: bastaría renombrar la
 *     excepción para que el campo dejara de exigirse.
 *   · `hoja`  → una exclusión declarada que nadie usa. Sin ella las
 *     declaraciones se pudren y acaban tapando campos futuros — la regla 4
 *     aplicada a las declaraciones de la propia sonda.
 *   · `tipo`  → un tipo del mapa que el AST no tiene. Tiene que salir por
 *     ERROR, **nunca por «cero campos»**, que es indistinguible de «esta
 *     colección está bien».
 *
 * Uso: npm run qa:cms-campos-neg
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, QA } from "./lib.mjs";

const casos = [
  {
    sabotaje: "campo",
    porQue: "campo real quitado de una colección ⇒ sale NOMBRADO, no como un total",
    salidaTiene: /SIN CONTRAPARTE en 'casos': cliente/,
    comprueba: (d) =>
      d.ausentes?.some((a) => a.coleccion === "casos" && a.campo === "cliente")
        ? null
        : "el campo ausente no está congelado en el artefacto",
  },
  {
    sabotaje: "alias",
    porQue: "un alias no puede tapar un hueco: si su destino no existe, es ALIAS ROTO",
    salidaTiene: /ALIAS ROTO/,
    comprueba: (d) =>
      d.problemas?.some((p) => p.clase === "ALIAS ROTO") ? null : "no congeló el ALIAS ROTO",
  },
  {
    sabotaje: "hoja",
    porQue: "una exclusión declarada y nunca usada se pudre ⇒ DECLARACIÓN MUERTA",
    salidaTiene: /DECLARACIÓN MUERTA — HOJAS\.TipoQueNoExiste/,
    comprueba: (d) =>
      d.problemas?.some((p) => p.clase === "DECLARACIÓN MUERTA") ? null : "no congeló la muerta",
  },
  {
    sabotaje: "tipo",
    porQue: "un tipo del mapa que no existe sale por ERROR, jamás por cero campos (regla 4)",
    salidaTiene: /TIPO MEDIDO NO ENCONTRADO/,
    comprueba: (d) =>
      d.problemas?.some((p) => p.clase === "TIPO MEDIDO NO ENCONTRADO")
        ? null
        : "no congeló el tipo no encontrado",
  },
];

console.log(`\n════════ TEST EN NEGATIVO · cms-campos ════════`);
console.log(`  4 sabotajes, cada uno por su propio invariante\n`);

const ev = new Evaluadas({ nombre: "cms-campos-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;

for (const c of casos) {
  const fichero = join(QA, `medidas/cms-campos-neg-${c.sabotaje}.json`);
  if (existsSync(fichero)) rmSync(fichero);

  const t0 = Date.now();
  const res = corridaNegativa({
    etiqueta: c.sabotaje,
    args: [join(QA, "cms-campos.mjs")],
    env: { SABOTAJE: c.sabotaje },
    timeout: 300_000,
  });
  const out = (res.stdout || "") + (res.stderr || "");
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(c.sabotaje, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== 2) mal = `esperaba exit 2, salió ${res.status}`;
  if (!mal && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && c.comprueba) {
    if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
    else mal = c.comprueba(JSON.parse(readFileSync(fichero, "utf8")));
  }

  if (mal) {
    fallos++;
    console.log(`  ❌ SABOTAJE=${c.sabotaje.padEnd(6)} (${seg}s)  ${mal}`);
  } else console.log(`  ✓  SABOTAJE=${c.sabotaje.padEnd(6)} (${seg}s)  ${c.porQue}`);
}

/* ── Y el CONTROL, que es la otra mitad: sin sabotaje tiene que salir VERDE.
 *    Sin él, una sonda que falle SIEMPRE pasaría los cuatro negativos. Es el
 *    complementario de la regla 4: *un patrón que casa en todas tampoco mide
 *    nada*. ──────────────────────────────────────────────────────────────── */
/* El CONTROL corre por `corridaNegativa`: su corrida escribe en
 * `cms-campos-neg-control.json` POR CONSTRUCCIÓN — antes iba con PISAR sobre la
 * canónica, que es la regla 5 automatizada (defecto 1 del HANDOFF 26.ª). */
const ctl = corridaNegativa({
  etiqueta: "control",
  args: [join(QA, "cms-campos.mjs")],
  timeout: 300_000,
});
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
if (ctl.status !== 0) {
  fallos++;
  console.log(`  ❌ CONTROL          exit ${ctl.status} — sin sabotaje tiene que salir 0`);
} else if (!/0 campos sin contraparte/.test(ctlOut)) {
  fallos++;
  console.log(`  ❌ CONTROL          exit 0 pero sin la línea de 0 campos sin contraparte`);
} else console.log(`  ✓  CONTROL         (sin sabotaje) exit 0 — la sonda no falla siempre`);

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} cms-campos · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   La comprobación sabe fallar por los cuatro invariantes y sabe pasar.\n` +
        `   Un verde suyo ya se puede leer como «las colecciones expresan lo medido».\n`
      : `   Un limpio de \`cms-campos\` NO se puede leer hasta que esto salga en verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
