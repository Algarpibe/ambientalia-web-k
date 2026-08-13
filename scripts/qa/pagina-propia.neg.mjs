/**
 * TEST EN NEGATIVO de `pagina-propia` — con control.
 * Uso: npm run qa:pagina-propia-neg
 *
 * La sonda sostiene **la condición 2 con la que se aceptó CMS-PR3** (*«un
 * condicional sin sus dos negativos no está probado»*), así que sus sabotajes
 * atacan justo eso:
 *
 *   · `un-solo-lado` — se saltan los dos cuadrantes de «el dato SOBRA». Es el
 *     recorte que una sonda escrita deprisa haría sola, y el que deja pasar un
 *     documento que MIENTE sobre si tiene página. Tiene que salir rojo **por
 *     cuadrantes sin evaluar**, no por un fallo de alta;
 *   · `discriminador-relleno` — la sonda deja de preguntar y RELLENA `pagina` en
 *     el caso que la exige. Ataca la condición 1: si el discriminador dejara de
 *     ser obligatorio, esto es exactamente lo que se vería, y sin la guarda daría
 *     verde.
 *
 * El **CONTROL** cierra el triángulo: los 6 cuadrantes evaluados y las 4
 * direcciones presentes. Sin él, los dos sabotajes los aprobaría una sonda que
 * rechaza todo.
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const casos = [
  {
    sabotaje: "un-solo-lado",
    exit: 2,
    porQue: "sin los cuadrantes de «sobra» el condicional NO está probado ⇒ SIN EVALUAR, en rojo",
    salidaTiene: /SIN EVALUAR/,
    comprueba: (d) =>
      d.cuadrantes?.filter((c) => c.saltado).length === 2
        ? null
        : `esperaba 2 cuadrantes saltados, salió ${d.cuadrantes?.filter((c) => c.saltado).length}`,
  },
  {
    sabotaje: "discriminador-relleno",
    exit: 2,
    porQue: "si la sonda rellena `pagina`, el alta entra y el cuadrante del discriminador FALLA",
    salidaTiene: /SIN pagina/,
    comprueba: (d) => {
      const c = d.cuadrantes?.find((x) => x.campo === "pagina");
      return c && c.ok === false && c.obtenido === "entra"
        ? null
        : `esperaba el cuadrante de \`pagina\` en rojo con «entra», salió ${JSON.stringify(c)}`;
    },
  },
];

console.log(`\n════════ TEST EN NEGATIVO · pagina-propia ════════`);
console.log(`  el condicional de CMS-PR3, falsado — ${casos.length} sabotajes + control\n`);

const ev = new Evaluadas({ nombre: "pagina-propia-neg", unidad: "sabotajes", minimo: casos.length });
let fallos = 0;

const corre = (etiqueta, env = {}) =>
  corridaNegativa({
    etiqueta,
    args: ["--env-file=apps/cms/.env", join(QA, "pagina-propia.mjs")],
    cwd: join(QA, "../.."),
    env,
    timeout: 600_000,
  });

for (const c of casos) {
  const fichero = join(QA, nombreNeg("medidas/pagina-propia.json", c.sabotaje));
  if (existsSync(fichero)) rmSync(fichero);

  const res = corre(c.sabotaje, { SABOTAJE: c.sabotaje });
  const out = (res.stdout || "") + (res.stderr || "");
  if (res.error || res.status === null) ev.fallo(c.sabotaje, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal) {
    if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
    else mal = c.comprueba(JSON.parse(readFileSync(fichero, "utf8")));
  }

  if (mal) { fallos++; console.log(`  ❌ SABOTAJE=${c.sabotaje.padEnd(22)} ${mal}`); }
  else console.log(`  ✓  SABOTAJE=${c.sabotaje.padEnd(22)} ${c.porQue}`);
}

/* ── EL CONTROL ─────────────────────────────────────────────────────────── */
const fCtl = join(QA, nombreNeg("medidas/pagina-propia.json", "control"));
if (existsSync(fCtl)) rmSync(fCtl);
const ctl = corre("control");
let malCtl = null;
if (ctl.status !== 0) malCtl = `exit ${ctl.status} — sin sabotaje tiene que salir 0`;
else if (!existsSync(fCtl)) malCtl = "no congeló su medida";
else {
  const d = JSON.parse(readFileSync(fCtl, "utf8"));
  const c = d.cuadrantes ?? [];
  if (c.length !== 6) malCtl = `${c.length} cuadrantes, esperaba 6`;
  else if (c.some((x) => x.saltado)) malCtl = `hay cuadrantes saltados en la corrida limpia`;
  else if (c.some((x) => !x.ok)) malCtl = `${c.filter((x) => !x.ok).length} cuadrante(s) en rojo sin sabotaje`;
  /* CUATRO direcciones, no tres: «obligatorio presente» · «obligatorio ausente ⇒
   * muere» · «prohibido presente ⇒ muere» · «required sin defecto ⇒ muere». La
   * cuarta es la del discriminador, y es la condición 1 de CMS-PR3. */
  else if (new Set(c.map((x) => x.direccion)).size !== 4) malCtl = `${new Set(c.map((x) => x.direccion)).size} direcciones distintas, esperaba 4`;
  /* Y que las dos direcciones de RECHAZO estén ejercidas por los DOS campos:
   * si sólo una de ellas apareciera, «los dos lados» sería la mitad. */
  else if (new Set(c.filter((x) => x.esperado === "rechazado").map((x) => x.campo)).size !== 3)
    malCtl = `los rechazos no cubren los 3 campos (seo.title · hrefServido · pagina)`;
}
if (malCtl) { fallos++; console.log(`  ❌ CONTROL   (sin sabotaje)      ${malCtl}`); }
else console.log(`  ✓  CONTROL   (sin sabotaje)      6 cuadrantes · 4 direcciones · rechazos en los 3 campos`);

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} pagina-propia · test en negativo: ${casos.length + 1 - fallos}/${casos.length + 1}\n` +
    (fallos === 0
      ? `   El condicional está probado por los DOS lados —falta y sobra— y el\n` +
        `   discriminador por el suyo. Un esquema que aceptara el dato de más NO\n` +
        `   pasaría esta sonda, que es la condición con la que CMS-PR3 se aceptó.\n`
      : `   CMS-PR3 NO se puede dar por probada hasta que esto salga verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
