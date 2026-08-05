/**
 * TEST EN NEGATIVO de `solutions-campos` — entero, cada sabotaje por SU invariante.
 * Uso: node solutions-campos.neg.mjs
 *
 * Los tres invariantes que esta sonda tiene que saber disparar por separado:
 *
 *   · `muerto`  → un selector que no casa en NINGUNA página sale por ERROR, no
 *                 por cero (regla 4 de `CLAUDE.md` §sondas);
 *   · `pleno`   → un patrón que casa en TODAS no discrimina (la complementaria);
 *   · `control` → **el propio**: si la sonda no ve campos en las 4 instancias
 *                 CONSTRUIDAS —cuyo modelo está en `src/lib`— entonces su «esta
 *                 forma tiene pocos campos» sobre las 20 sin medir es
 *                 indistinguible de un cero de instrumento. Es el sabotaje que
 *                 prueba que el control **no es decorativo**.
 *
 * Se corre sobre UNA página y tiene que ser una del CONTROL: es la única con
 * respuesta conocida (su modelo existe en `src/lib`), o sea la única donde un
 * «no veo campos» se puede declarar falso.
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const SOLO = "monitor-calidad-aire";
const SUF = `-solo-${SOLO.replace(/[^a-z0-9]+/gi, "-")}`;

const casos = [
  {
    sabotaje: "muerto",
    porQue: "selector que no casa en ninguna página ⇒ ERROR, nunca cero (regla 4)",
    salidaTiene: /SELECTOR\(ES\) MUERTO\(S\)/,
  },
  {
    sabotaje: "pleno",
    porQue: "patrón que casa en todas ⇒ PLENO: no discrimina (la complementaria)",
    salidaTiene: /PATRÓN UBICUO/,
  },
  {
    sabotaje: "control",
    porQue: "sin campos en una instancia CONSTRUIDA ⇒ el CONTROL grita en vez de informar «forma pobre»",
    salidaTiene: /CONTROL\(ES\) CON CERO MÓDULOS/,
    // Y se comprueba en el artefacto: el cero tiene que estar EN el fichero,
    // no solo en la consola — lo que imprime y lo que congela es lo mismo.
    comprueba: (d) => (d.paginas[SOLO]?.nModulos === 0 ? null : `esperaba nModulos=0 congelado, salió ${d.paginas[SOLO]?.nModulos}`),
  },
];

console.log(`\n════════ TEST EN NEGATIVO · solutions-campos ════════`);
console.log(`  página: ${SOLO} (del CONTROL — la única con respuesta conocida)\n`);

const ev = new Evaluadas({ nombre: "solutions-campos-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;

for (const c of casos) {
  const fichero = join(QA, `medidas/solutions-campos-neg-${c.sabotaje}${SUF}.json`);
  if (existsSync(fichero)) rmSync(fichero);

  const t0 = Date.now();
  const res = corridaNegativa({
    etiqueta: c.sabotaje,
    args: [join(QA, "solutions-campos.mjs")],
    env: { SABOTAJE: c.sabotaje, SOLO },
    timeout: 600_000,
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

  if (mal) { fallos++; console.log(`  ❌ SABOTAJE=${c.sabotaje.padEnd(8)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  SABOTAJE=${c.sabotaje.padEnd(8)} (${seg}s)  ${c.porQue}`);
}

/* ── EL CONTROL DE VERDAD (añadido 2026-08-04, F2-2 bloque 2) ─────────────
 * El pendiente 8 del HANDOFF 26.ª, cobrado al tocar el fichero: este test
 * tenía un SABOTAJE *llamado* `control` —que prueba que la guarda del cero
 * dispara— y NINGUNA corrida limpia. Sin ella, una sonda rota de fábrica
 * pasaría los tres sabotajes (F2-1 §5). La corrida limpia va por NEG=control,
 * así que escribe en su propio nombre por construcción. */
const fCtl = join(QA, nombreNeg(`medidas/solutions-campos${SUF}.json`, "control"));
if (existsSync(fCtl)) rmSync(fCtl);
const t0 = Date.now();
const ctl = corridaNegativa({
  etiqueta: "control",
  args: [join(QA, "solutions-campos.mjs")],
  env: { SOLO },
  timeout: 600_000,
});
const segCtl = ((Date.now() - t0) / 1000).toFixed(0);
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!existsSync(fCtl)) malCtl = "no congeló su medida";
else {
  const d = JSON.parse(readFileSync(fCtl, "utf8"));
  const n = d.paginas[SOLO]?.nModulos;
  if (!(n > 0)) malCtl = `la instancia CONSTRUIDA salió con nModulos=${n} — el control no vio nada`;
}
if (malCtl) { fallos++; console.log(`  ❌ CONTROL   (sin sabotaje) (${segCtl}s)  ${malCtl}`); }
else console.log(`  ✓  CONTROL   (sin sabotaje) (${segCtl}s)  exit 0 y la CONSTRUIDA trae módulos — la sonda no falla siempre`);

const total = casos.length + 1;
console.log(
  `\n${fallos === 0 ? "✅" : "❌"} solutions-campos · test en negativo: ${total - fallos}/${total}\n` +
    (fallos === 0
      ? `   El CONTROL dispara por su cuenta, la corrida limpia pasa, así que un «esta\n` +
        `   forma trae pocos campos» de esta sonda no puede ser un cero de instrumento.\n`
      : `   Un limpio de esta sonda NO se puede leer hasta que esto salga en verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
