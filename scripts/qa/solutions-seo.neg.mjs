/**
 * TEST EN NEGATIVO de `solutions-seo` — entero, cada sabotaje por SU invariante,
 * **y con control**.
 *
 * Esta sonda decidió que `productos.seo.title` es `required` y es CAMPO. Las dos
 * mitades de esa afirmación pueden salir mal por el mismo mecanismo —*no
 * encontrar nada y no mirar nada dan la misma salida*— y por sitios distintos:
 *
 *   · si el selector del `h1` no casara, «no contiene el h1» saldría en las 24 y
 *     el veredicto diría **CAMPO** sin haber comparado nada. `muerto` prueba que
 *     eso sale por ERROR (regla 4, vía `Censo`);
 *   · si la sonda dijera **CAMPO** pase lo que pase, su «no derivable» no
 *     valdría. `derivable` fabrica el mundo contrario —título = `«h1» | Kunak`
 *     en todas— y exige que el veredicto **voltee a PLANTILLA**;
 *   · si el sitemap no diera URLs, 0 medidas se leerían como 0 problemas.
 *     `sin-urls` exige exit 2.
 *
 * Y el **CONTROL**, que es la mitad que decide si los tres significan algo:
 * sin sabotaje, exit 0 y veredicto CAMPO. Sin él, una sonda que fallara siempre
 * los aprobaría los tres (F2-1 §5).
 *
 * ⚠ Se corre con `SOLO=cartuchos-inteligentes` — **17 de las 24 URLs**, que es
 * muestra de sobra para que «plantilla única» signifique algo y ahorra 4 cargas
 * completas del original en cada corrida. El contrato de `Evaluadas` se deriva
 * de la lista FILTRADA, así que el mínimo baja con ella y no queda flojo.
 *
 * Uso: npm run qa:solutions-seo-neg
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { Evaluadas, QA } from "./lib.mjs";

const SOLO = "cartuchos-inteligentes";
const SUF = `-solo-${SOLO.replace(/[^a-z0-9]+/gi, "-")}`;

const casos = [
  {
    sabotaje: "muerto",
    exit: 2,
    porQue: "selector del `h1` que no casa en ninguna página ⇒ ERROR, nunca «no lo contiene»",
    salidaTiene: /SELECTOR\(ES\) MUERTO\(S\)/,
  },
  {
    sabotaje: "derivable",
    exit: 0,
    porQue: "título fabricado del h1 con plantilla única ⇒ el veredicto VOLTEA a PLANTILLA",
    salidaTiene: /DERIVABLE del h1/,
    comprueba: (d) =>
      d.veredicto?.titulo === "PLANTILLA"
        ? null
        : `esperaba veredicto PLANTILLA congelado, salió ${d.veredicto?.titulo}`,
  },
  {
    sabotaje: "sin-urls",
    exit: 2,
    porQue: "0 URLs del sitemap ⇒ no es una corrida limpia, y no un verde vacío",
    salidaTiene: /0 URLs del CPT solutions/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · solutions-seo ════════`);
console.log(`  alcance de cada corrida: SOLO=${SOLO} (17 de las 24 URLs del CPT)\n`);

const ev = new Evaluadas({ nombre: "solutions-seo-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;

const corre = (env) =>
  spawnSync(process.execPath, [join(QA, "solutions-seo.mjs")], {
    env: { ...process.env, SOLO, PISAR: "1", ...env },
    encoding: "utf8",
    timeout: 900_000,
  });

for (const c of casos) {
  const fichero = join(QA, `medidas/solutions-seo-neg-${c.sabotaje}${SUF}.json`);
  if (existsSync(fichero)) rmSync(fichero);

  const t0 = Date.now();
  const res = corre({ SABOTAJE: c.sabotaje });
  const out = (res.stdout || "") + (res.stderr || "");
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(c.sabotaje, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && c.comprueba) {
    if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
    else mal = c.comprueba(JSON.parse(readFileSync(fichero, "utf8")));
  }

  if (mal) { fallos++; console.log(`  ❌ SABOTAJE=${c.sabotaje.padEnd(10)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  SABOTAJE=${c.sabotaje.padEnd(10)} (${seg}s)  ${c.porQue}`);
}

/* ── EL CONTROL ─────────────────────────────────────────────────────────── */
/* ⚠ El CONTROL escribe en SU PROPIO nombre. Antes iba con PISAR sobre la
 * medida canónica: una corrida de un test en negativo re-congelando la
 * evidencia buena, que es la regla 5 automatizada. */
const F_CTL = `medidas/solutions-seo-neg-control${SUF}.json`;
const fCtl = join(QA, F_CTL);
if (existsSync(fCtl)) rmSync(fCtl);
const t0 = Date.now();
const ctl = corre({ SALIDA: F_CTL });
const seg = ((Date.now() - t0) / 1000).toFixed(0);
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!/NO derivable del h1/.test(ctlOut)) malCtl = "sin la línea «NO derivable del h1»";
else if (!existsSync(fCtl)) malCtl = "no congeló su medida";
else {
  const d = JSON.parse(readFileSync(fCtl, "utf8"));
  if (d.veredicto?.titulo !== "CAMPO") malCtl = `veredicto ${d.veredicto?.titulo}, esperaba CAMPO`;
  else if (d.presencia?.title !== d.filas.length) malCtl = `title ${d.presencia?.title}/${d.filas.length} — el respaldo del \`required\` no sale`;
}
if (malCtl) { fallos++; console.log(`  ❌ CONTROL    (sin sabotaje) (${seg}s)  ${malCtl}`); }
else console.log(`  ✓  CONTROL    (sin sabotaje) (${seg}s)  exit 0, veredicto CAMPO y title en todas`);

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} solutions-seo · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   La sonda sabe gritar cuando su selector no casa, sabe decir PLANTILLA\n` +
        `   cuando el título es derivable, y sabe negarse a medir 0 URLs. Su\n` +
        `   «\`seo.title\` es CAMPO y el \`required\` está respaldado» ya se puede leer.\n`
      : `   El respaldo de \`productos.seo.title\` NO se puede citar hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
