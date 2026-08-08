/**
 * TEST EN NEGATIVO de `publicar` — un sabotaje por invariante, con control.
 * Uso: npm run qa:publicar-neg
 *
 * ── Qué hay que poder falsar ──────────────────────────────────────────────
 * `qa:publicar` afirma cuatro cosas. Cada una puede ser falsa por un camino
 * distinto, y **dos de los tres sabotajes producen un sistema que sigue
 * funcionando**, que es lo que los hace valer:
 *
 *   1 · **`sin-auth`** — el endpoint acepta a cualquiera. Nada se rompe: los
 *       builds salen bien, el sitio se publica. Sólo que lo puede disparar
 *       quien quiera. **Sin A, «tiene auth» sería una frase sin instrumento**;
 *   2 · **`politica-descartar`** — la política que la §1 del publicador
 *       descarta, y el falsador que justifica cómo está escrito C. **Medido:**
 *       limpio → 4 disparos · 2 builds · **0 huérfanos**; con descartar →
 *       4 disparos · 1 build · **3 huérfanos**. Lo que discrimina son los
 *       huérfanos, **no el recuento de builds**: «1 build para 4 disparos» es
 *       también lo que produce un coalescer correcto cuando los 4 llegan antes
 *       de que arranque, así que una guarda que contara builds no podría
 *       distinguir el caso bueno del malo;
 *   3 · **`promociona-roto`** — promocionar sin mirar el código de salida, o
 *       sea reconstruir en sitio, que es lo que se hacía antes de F2-4. Su
 *       efecto medido: un build fallido **borra el bueno**.
 *
 * ── ⚠ Y este negativo ROMPE `.next` a propósito, así que lo reconstruye ──
 * `promocina-roto` deja el artefacto sin `BUILD_ID` — es literalmente lo que
 * viene a demostrar. Un negativo que deje el repo sin build sería un negativo
 * que nadie vuelve a correr, así que al terminar **comprueba y reconstruye**, y
 * lo dice. Cuesta ~45 s y es el precio de que el falsador sea real.
 */
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import { APP, corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const SONDA = join(QA, "publicar.mjs");
const salidaDe = (etiqueta) => nombreNeg(`medidas/publicar-${etiqueta}.json`, etiqueta);

const casos = [
  {
    etiqueta: "sin-auth",
    porQue: "el endpoint acepta sin credencial ⇒ A cae (y NADA MÁS se rompe: por eso hace falta A)",
    env: { SABOTAJE: "sin-auth" },
    salidaTiene: /✗ A·auth/,
  },
  {
    etiqueta: "politica-descartar",
    porQue:
      "descartar el disparo que llega durante un build ⇒ C cae con 3 de 4 huérfanos. " +
      "Y el recuento de builds NO lo discrimina: 1 build para 4 disparos es también lo " +
      "que produce un coalescer correcto si los 4 llegan antes de arrancar",
    env: { SABOTAJE: "politica-descartar" },
    salidaTiene: /✗ C·invariante de disparo/,
  },
  {
    etiqueta: "promociona-roto",
    porQue: "promocionar sin mirar el exit ⇒ D cae: el build fallido se lleva por delante al bueno",
    env: { SABOTAJE: "promociona-roto" },
    salidaTiene: /✗ D·fallo no pisa \.next/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · publicar ════════\n`);

const ev = new Evaluadas({ nombre: "publicar-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;

/* ── EL CONTROL, primero ───────────────────────────────────────────────────
 * Un sabotaje sólo aísla algo si parte de una corrida que ya sale limpia. Y el
 * control tiene que decir **cuántos invariantes miró**: salir 0 habiendo
 * evaluado ninguno no distingue «se cumplen» de «no miré». */
const salCtl = salidaDe("control");
if (existsSync(join(QA, salCtl))) rmSync(join(QA, salCtl));
const ctl = corridaNegativa({ etiqueta: "control", args: [SONDA], env: { SALIDA: salCtl } });
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
const nInv = /evaluadas (\d+)\/(\d+) invariantes/.exec(ctlOut);
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!nInv) malCtl = "no dice cuántos invariantes evaluó";
else if (Number(nInv[1]) < Number(nInv[2])) malCtl = `evaluó ${nInv[1]} de ${nInv[2]}`;
if (malCtl) {
  fallos++;
  console.log(`  ❌ CONTROL              ${malCtl}`);
} else {
  console.log(`  ✓  CONTROL              exit 0 · ${nInv[1]}/${nInv[2]} invariantes`);
}

for (const c of casos) {
  const sal = salidaDe(c.etiqueta);
  if (existsSync(join(QA, sal))) rmSync(join(QA, sal));
  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [SONDA], env: { ...c.env, SALIDA: sal } });
  const out = (res.stdout || "") + (res.stderr || "");
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  /* Todos los sabotajes tienen que salir 1: el invariante se EVALUÓ y se
   * incumplió. Un exit distinto de 1 sería «no se pudo evaluar», que es otra
   * frase (§sondas 4bis) y no prueba que la guarda muerda. */
  if (res.status !== 1) mal = `esperaba exit 1, salió ${res.status}`;
  if (!mal && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (mal) {
    fallos++;
    console.log(`  ❌ ${c.etiqueta.padEnd(20)} ${mal}`);
  } else console.log(`  ✓  ${c.etiqueta.padEnd(20)} ${c.porQue}`);
}

/* ── Reconstruir lo que `promociona-roto` se llevó ─────────────────────── */
if (!existsSync(join(APP, ".next/BUILD_ID"))) {
  console.log(`\n  · \`.next\` sin BUILD_ID (lo esperado tras \`promociona-roto\`): reconstruyendo…`);
  const b = spawnSync("npm", ["run", "build", "-w", "web"], {
    cwd: join(QA, "../.."),
    shell: true,
    encoding: "utf8",
    timeout: 600_000,
  });
  if (b.status !== 0) {
    fallos++;
    console.log(`  ❌ NO se pudo reconstruir \`.next\` (exit ${b.status}). El repo queda SIN BUILD.`);
  } else console.log(`  ✓  \`.next\` reconstruido`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} publicar · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   Ve un endpoint abierto, ve una política que pierde publicaciones (3 de 4 huérfanos\n` +
        `   contra 0) y ve un build fallido pisando al bueno.\n`
      : `   Los cuatro invariantes del publicador NO se pueden citar hasta que esto salga verde.\n`),
);
ev.informe();
process.exitCode = fallos === 0 ? 0 : 2;
