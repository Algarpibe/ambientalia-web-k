/**
 * TEST EN NEGATIVO de `roles` — cada sabotaje por SU invariante, con control.
 * Uso: npm run qa:roles-neg          (necesita el Postgres del CMS vivo)
 *
 * `roles` afirma «editor = contenido; usuarios y sistema, del admin». Esa
 * frase puede ser falsa por dos caminos y ninguno da error por sí solo:
 *
 *   1 · **que el acceso no esté cableado** — `sin-acceso`: usuarios y slugs
 *       vuelven al defecto «cualquier autenticado» y un editor crea usuarios,
 *       ve la lista entera y escribe en el registro. Tiene que romper R2, R3
 *       y R5 — si no rompe, la sonda no está midiendo el acceso;
 *   2 · **que la escalada se descarte en silencio** — `sin-guarda-rol`: sin el
 *       `beforeChange`, el `rol: "admin"` de un editor… ¿entra o se descarta?
 *       Cualquiera de los dos rompe R4, que exige CAER CON MENSAJE.
 *
 * El control corre PRIMERO: un sabotaje sólo aísla algo si parte de una
 * corrida que ya sale limpia.
 */
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const SONDA = join(QA, "roles.mjs");
const salidaDe = (etiqueta) => nombreNeg(`medidas/roles-${etiqueta}.json`, etiqueta);

const casos = [
  {
    etiqueta: "sin-acceso",
    exit: 1,
    porQue: "acceso al defecto «cualquier autenticado» ⇒ un editor crea usuarios, ve la lista y escribe el registro",
    env: { SABOTAJE: "sin-acceso" },
    salidaTiene: /R2|R3|R5/,
  },
  {
    etiqueta: "sin-guarda-rol",
    exit: 1,
    porQue: "sin el beforeChange, la escalada entra o se descarta en silencio — R4 exige caer con mensaje",
    env: { SABOTAJE: "sin-guarda-rol" },
    salidaTiene: /R4/,
  },
];

console.log(`\n════════ TEST EN NEGATIVO · roles ════════\n`);

const ev = new Evaluadas({ nombre: "roles-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;

/* El CONTROL primero: exit 0 y los 8 invariantes evaluados. */
const salCtl = salidaDe("control");
if (existsSync(join(QA, salCtl))) rmSync(join(QA, salCtl));
const ctl = corridaNegativa({ etiqueta: "control", args: [SONDA], env: { SALIDA: salCtl } });
const ctlOut = (ctl.stdout || "") + (ctl.stderr || "");
const octeto = /los 8 invariantes se cumplen/.test(ctlOut);
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!octeto) malCtl = "no dice que los 8 invariantes se cumplen";
if (malCtl) {
  fallos++;
  console.log(`  ❌ CONTROL          ${malCtl}`);
  console.log(ctlOut.split("\n").slice(-25).join("\n"));
} else console.log(`  ✓  CONTROL          exit 0 · los 8 invariantes se cumplen`);

for (const c of casos) {
  const sal = salidaDe(c.etiqueta);
  if (existsSync(join(QA, sal))) rmSync(join(QA, sal));
  const res = corridaNegativa({ etiqueta: c.etiqueta, args: [SONDA], env: { ...c.env, SALIDA: sal } });
  const out = (res.stdout || "") + (res.stderr || "");
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  /* El fallo tiene que venir del invariante del sabotaje, no de otro: se exige
   * el ✗ en SU R-línea, no un exit 1 cualquiera. */
  const rotoSuyo = out
    .split("\n")
    .some((l) => l.trimStart().startsWith("✗") && c.salidaTiene.test(l));
  let mal = null;
  if (res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && !rotoSuyo) mal = `no cayó por su invariante (${c.salidaTiene})`;
  if (mal) {
    fallos++;
    console.log(`  ❌ ${c.etiqueta.padEnd(16)} ${mal}`);
    console.log(out.split("\n").slice(-20).join("\n"));
  } else console.log(`  ✓  ${c.etiqueta.padEnd(16)} ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} roles · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   El acceso discrimina (no es «cualquier autenticado») y la escalada cae por su\n` +
        `   invariante — el verde de \`qa:roles\` está respaldado por sus dos falsadores.\n`
      : `   «editor = contenido; usuarios, del admin» NO se puede citar hasta que esto salga verde.\n`),
);
ev.informe();
process.exitCode = fallos === 0 ? 0 : 2;
