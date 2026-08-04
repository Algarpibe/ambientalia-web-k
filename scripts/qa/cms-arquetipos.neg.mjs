/**
 * TEST EN NEGATIVO de `cms-arquetipos` — **el par de discriminación**, con control.
 *
 * Esta sonda no es una guarda, es un **clasificador**, y por eso su modo de
 * fallo no se parece a los demás de este directorio: no es «no salta cuando
 * debería», es **«clasifica igual pase lo que pase»**. Un clasificador ciego que
 * dijera CONSTRUIDA en las nueve daría la misma salida que uno que mide, y la
 * premisa del §F2-2 —*«`src/lib/*.ts` son los datos»*— quedaría «confirmada»
 * por un instrumento que no miró.
 *
 *   · `sin-manifiesto`  — sin `prerender-manifest.json` la lista de rutas sale
 *     **vacía** y todo se clasificaría REFERENCIADO. Es la regla del cero
 *     aplicada a la raíz, exactamente la que se pagó en la mudanza a monorepo
 *     (*«una sonda que no mide ninguna ruta NO da error: da verde»*). Exit ≠ 0;
 *   · `todo-construido` — 0 referenciadas;
 *   · `nada-construido` — 0 construidas.
 *
 * **Los dos últimos son el par**: si el veredicto congelado no se mueve entre
 * ellos, la sonda no está midiendo. Y el **CONTROL** da el reparto real —
 * `productos` MIXTA y `taxonomia-sectores` REFERENCIADA—, que es lo que hace que
 * los dos extremos signifiquen algo.
 *
 * Necesita un build: `npm run build` antes.
 * Uso: npm run qa:cms-arquetipos-neg
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, QA } from "./lib.mjs";

const casos = [
  {
    sabotaje: "sin-manifiesto",
    exit: 2,
    porQue: "sin manifiesto, 0 rutas ⇒ todo REFERENCIADO. Sale por ERROR, no por verde",
    salidaTiene: /no hay `prerender-manifest.json`/,
  },
  {
    sabotaje: "todo-construido",
    exit: 0,
    porQue: "toda fila con ruta ⇒ 0 referenciadas (el extremo optimista)",
    comprueba: (d) =>
      d.meta.veredicto.referenciadas.length === 0 && d.meta.veredicto.mixtas.length === 0
        ? null
        : `esperaba 0 referenciadas y 0 mixtas, salió [${d.meta.veredicto.referenciadas}] / [${d.meta.veredicto.mixtas}]`,
  },
  {
    sabotaje: "nada-construido",
    exit: 0,
    porQue: "ninguna fila con ruta ⇒ 0 construidas (el extremo pesimista)",
    comprueba: (d) =>
      d.meta.veredicto.construidas.length === 0 && d.meta.veredicto.mixtas.length === 0
        ? null
        : `esperaba 0 construidas y 0 mixtas, salió [${d.meta.veredicto.construidas}] / [${d.meta.veredicto.mixtas}]`,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · cms-arquetipos ════════`);
console.log(`  clasificador, no guarda: lo que se prueba es que DISCRIMINA\n`);

const ev = new Evaluadas({ nombre: "cms-arquetipos-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;

const corre = (env) =>
  spawnSync(process.execPath, [join(QA, "cms-arquetipos.mjs")], {
    env: { ...process.env, PISAR: "1", ...env },
    encoding: "utf8",
    timeout: 300_000,
  });

const veredictos = [];
for (const c of casos) {
  const fichero = join(QA, `medidas/cms-arquetipos-neg-${c.sabotaje}.json`);
  if (existsSync(fichero)) rmSync(fichero);

  const res = corre({ SABOTAJE: c.sabotaje });
  const out = (res.stdout || "") + (res.stderr || "");
  if (res.error || res.status === null) ev.fallo(c.sabotaje, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && c.comprueba) {
    if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
    else {
      const d = JSON.parse(readFileSync(fichero, "utf8"));
      veredictos.push(JSON.stringify(d.meta.veredicto));
      mal = c.comprueba(d);
    }
  }

  if (mal) { fallos++; console.log(`  ❌ SABOTAJE=${c.sabotaje.padEnd(16)}  ${mal}`); }
  else console.log(`  ✓  SABOTAJE=${c.sabotaje.padEnd(16)}  ${c.porQue}`);
}

/* ── EL CONTROL: el reparto real. Sin él, los dos extremos podrían ser el
 *    mismo instrumento contestando a su propio sabotaje. ─────────────────── */
/* ⚠ El CONTROL escribe en SU PROPIO nombre. Antes iba con PISAR sobre la
 * medida canónica: una corrida de un test en negativo re-congelando la
 * evidencia buena, que es la regla 5 automatizada. */
const F_CTL = "medidas/cms-arquetipos-neg-control.json";
const fCtl = join(QA, F_CTL);
const ctl = corre({ SALIDA: F_CTL });
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!existsSync(fCtl)) malCtl = "no congeló su medida";
else {
  const v = JSON.parse(readFileSync(fCtl, "utf8")).meta.veredicto;
  veredictos.push(JSON.stringify(v));
  if (!v.mixtas.includes("productos"))
    malCtl = `\`productos\` no sale MIXTA — es la fila que sostiene «la premisa es falsa para 6 de 9»`;
  else if (!v.referenciadas.length && !v.mixtas.length)
    malCtl = "todo CONSTRUIDA: el clasificador no está distinguiendo nada";
}
/* Y la comprobación que hace del par un par: los tres veredictos son distintos. */
if (!malCtl && new Set(veredictos).size !== veredictos.length)
  malCtl = `dos corridas dieron el MISMO veredicto: el clasificador no discrimina`;

if (malCtl) { fallos++; console.log(`  ❌ CONTROL    (sin sabotaje)     ${malCtl}`); }
else console.log(`  ✓  CONTROL    (sin sabotaje)     el reparto real, y los 3 veredictos son distintos`);

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} cms-arquetipos · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   El clasificador se mueve con lo que mide y grita cuando su fuente de rutas\n` +
        `   no está. Su «CONSTRUIDA vs REFERENCIADA» ya se puede llevar al PLAN.\n`
      : `   La clasificación de arquetipos NO se puede citar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
