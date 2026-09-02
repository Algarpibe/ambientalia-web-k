/**
 * TEST EN NEGATIVO de `cms-slugs` — entero, y **cada sabotaje rompe SU
 * invariante**, no otro.
 *
 * `PLAN-FASE-2.md` §F2-1 lo pone como condición de «hecho», literal: *«la guarda
 * de colisión **falla en negativo** […] y pasa en limpio al quitarlo. **Guarda
 * probada en negativo o no hay guarda.**»*
 *
 * Y aquí hace más falta que de costumbre, porque el fallo que esta guarda
 * previene **no da error de por sí**: una colisión de slug compila, emite la
 * ruta por las dos vías y sirve la página equivocada con HTTP 200. Si la guarda
 * tampoco fallara, el silencio sería total en las dos puntas.
 *
 *   · `sin-hook`        — `terminos-kunakpedia` sin hook ⇒ rompe el invariante 2
 *                         (la colisión deja de caer). Sin este sabotaje, «cayó»
 *                         no distingue *la guarda funciona* de *falló otra cosa*.
 *   · `fuera-plano`     — `productos` registra aunque tenga `padre` ⇒ rompe el 4.
 *                         Es el negativo del ALCANCE: prueba que el predicado de
 *                         §2e está vivo y no es un comentario. Sin él, la guarda
 *                         inventaría colisiones en 18 de 24 productos.
 *   · `sin-afterdelete` — `entradas-blog` no suelta al borrar ⇒ rompe el 5, o sea
 *                         la guarda empieza a bloquear altas **legítimas**. Es la
 *                         otra forma de que una guarda deje de servir, y la que
 *                         no se ve mirando sólo si «sabe decir que no».
 *
 * ⚠ El invariante **6** (CMS-9, 140.ª) no tiene sabotaje propio aquí — mismo
 * patrón que el 1 y el 3, ya sin nombre en esta lista: vive DENTRO de
 * `enPlano()`, compartida por las seis, y no hay forma de apagarla sólo para
 * una colección sin añadir una superficie que ninguna colección real
 * necesita. Se verificó discriminando por el otro canal: contra el código
 * anterior a CMS-9 el 6 CAE (la colisión real que §CMS-9 midió); contra el de
 * la 140.ª, pasa. `qa:cms-slugs-neg` sólo comprueba que el CONTROL lo incluye.
 *
 * Uso: npm run qa:cms-slugs-neg      (necesita el Postgres del CMS vivo)
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, QA } from "./lib.mjs";

const casos = [
  {
    sabotaje: "sin-hook",
    rompe: 2,
    porQue: "sin hook, la colisión ENTRE familias deja de caer — el fallo del §4 en directo",
    comprueba: (d) =>
      d.pasos?.find((p) => p.paso.startsWith("2 ·"))?.ok === false
        ? null
        : "el invariante 2 no salió roto",
  },
  {
    sabotaje: "fuera-plano",
    rompe: 4,
    porQue: "el predicado de §2e está VIVO: sin él, 18 de 24 productos colisionarían en falso",
    comprueba: (d) =>
      d.pasos?.find((p) => p.paso.startsWith("4 ·"))?.ok === false
        ? null
        : "el invariante 4 no salió roto",
  },
  {
    sabotaje: "sin-afterdelete",
    rompe: 5,
    porQue: "sin soltar, un borrado quema el slug y la guarda bloquea altas LEGÍTIMAS",
    comprueba: (d) =>
      d.pasos?.find((p) => p.paso.startsWith("5 ·"))?.ok === false
        ? null
        : "el invariante 5 no salió roto",
  },
];

console.log(`\n════════ TEST EN NEGATIVO · cms-slugs ════════`);
console.log(`  ${casos.length} sabotajes, cada uno rompiendo su propio invariante\n`);

const ev = new Evaluadas({ nombre: "cms-slugs-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;

for (const c of casos) {
  const fichero = join(QA, `medidas/cms-slugs-neg-${c.sabotaje}.json`);
  if (existsSync(fichero)) rmSync(fichero);

  const t0 = Date.now();
  const res = corridaNegativa({
    etiqueta: c.sabotaje,
    args: ["--env-file=apps/cms/.env", join(QA, "cms-slugs.mjs")],
    env: { SABOTAJE: c.sabotaje },
    cwd: join(QA, "../.."),
    timeout: 300_000,
  });
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(c.sabotaje, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== 1) mal = `esperaba exit 1, salió ${res.status}`;
  if (!mal) {
    if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
    else mal = c.comprueba(JSON.parse(readFileSync(fichero, "utf8")));
  }

  if (mal) {
    fallos++;
    console.log(`  ❌ SABOTAJE=${c.sabotaje.padEnd(16)} (${seg}s)  ${mal}`);
  } else
    console.log(`  ✓  SABOTAJE=${c.sabotaje.padEnd(16)} (${seg}s)  rompe el ${c.rompe} · ${c.porQue}`);
}

/* ── El CONTROL: sin sabotaje, los cinco invariantes pasan. Sin esta mitad,
 *    una sonda que fallara SIEMPRE aprobaría los tres negativos. ─────────── */
/* El CONTROL corre por `corridaNegativa`: escribe en `cms-slugs-neg-control.json`
 * POR CONSTRUCCIÓN — antes iba con PISAR sobre la canónica (regla 5 automatizada,
 * defecto 1 del HANDOFF 26.ª). */
const ctl = corridaNegativa({
  etiqueta: "control",
  args: ["--env-file=apps/cms/.env", join(QA, "cms-slugs.mjs")],
  cwd: join(QA, "../.."),
  timeout: 300_000,
});
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
if (ctl.status !== 0) {
  fallos++;
  console.log(`  ❌ CONTROL                          exit ${ctl.status} — sin sabotaje tiene que salir 0`);
} else if (!/los 6 invariantes del plano/.test(ctlOut)) {
  fallos++;
  console.log(`  ❌ CONTROL                          exit 0 pero sin la línea de los 6 invariantes`);
} else console.log(`  ✓  CONTROL          (sin sabotaje) exit 0 — la sonda no falla siempre`);

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} cms-slugs · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   La guarda sabe decir que NO (2), sabe respetar el alcance (4) y sabe\n` +
        `   volver a decir que sí (5). Un verde suyo ya se puede leer.\n`
      : `   Un limpio de \`cms-slugs\` NO se puede leer hasta que esto salga en verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
