/**
 * TEST EN NEGATIVO de `vacio-legal`.
 * Uso: npm run qa:vacio-legal-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * | sabotaje | cae por | y NO por |
 * |---|---|---|
 * | `rechaza-vacio` | el vacío deja de entrar ⇒ **el defecto viejo restaurado** | un error de conexión |
 * | `admite-ausente` | la ausencia entra ⇒ **se ablandó de más** | nada: es el fallo que NO da error solo |
 * | `control` | ✅ vacío entra · ausente muere · el ablandamiento no se derramó | — |
 *
 * ── El sabotaje que da valor a la guarda es `admite-ausente` ──────────────
 * `rechaza-vacio` reproduce el defecto que la tanda vino a arreglar: útil, y
 * evidente en cuanto pasa. El otro es el peligroso, porque **ablandar de más no
 * hace fallar nada**: el alta pasa, el documento entra sin título y lo que
 * revienta es el render, más tarde y delante del editor. Es literalmente
 * §F2-5-ESCALÓN-ETIQUETAS, y por eso el defecto se pone en la dirección que
 * grita — ausente MUERE, vacío ENTRA — y esta sonda lo comprueba en las dos
 * direcciones, no en una.
 *
 * ⚠ **Y el tercer caso del control no es decorativo:** sin él, «lo hemos
 * ablandado» y «lo hemos ablandado en todas partes» darían el mismo verde. El
 * `faqs.titulo` con `required` normal tiene que **seguir rechazando** el vacío.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { corridaNegativa, Evaluadas, nombreNeg, QA } from "./lib.mjs";

const CANONICA = "medidas/vacio-legal.json";

const casos = [
  {
    etiqueta: "control",
    porQue: "vacío entra · ausente muere · faqs sigue rechazando el vacío",
    env: {},
    exit: 0,
    salidaTiene: /el vacío entra, la ausencia muere/,
    comprueba: (j) => {
      if (j.fallos !== 0) return `${j.fallos} caso(s) fallando`;
      if (j.casos.length !== 3) return `${j.casos.length} casos, no 3`;
      if (!j.casos.some((c) => /faqs/.test(c.caso))) return "falta el caso del ESTRECHAMIENTO: sin él no se distingue de ablandarlo todo";
      return null;
    },
  },
  {
    etiqueta: "rechaza-vacio",
    porQue: "si «vacío» vuelve a comportarse como «ausente», el alta de esmog falla y la sonda sale ROJA",
    env: { SABOTAJE: "rechaza-vacio" },
    exit: 2,
    comprueba: (j) => {
      const c = j.casos.find((x) => x.caso === "vacío ENTRA");
      return c && !c.ok ? null : "el sabotaje no impidió el alta del vacío";
    },
  },
  {
    etiqueta: "admite-ausente",
    porQue: "si la AUSENCIA entra, el documento se guarda sin título y lo que revienta es el render",
    env: { SABOTAJE: "admite-ausente" },
    exit: 2,
    comprueba: (j) => {
      const c = j.casos.find((x) => x.caso === "ausente MUERE");
      return c && !c.ok ? null : "el sabotaje no consiguió que la ausencia entrara";
    },
  },
];

console.log(`\n════════ TEST EN NEGATIVO · vacio-legal ════════`);
console.log(`  alcance: altas reales contra Payload (Local API) · la sonda crea y borra sus documentos\n`);

const ev = new Evaluadas({ nombre: "vacio-legal-neg", unidad: "sabotajes", minimo: casos.length });

let fallos = 0;
for (const c of casos) {
  const fichero = nombreNeg(join(QA, CANONICA), c.etiqueta);
  if (existsSync(fichero)) rmSync(fichero);

  const t0 = Date.now();
  const res = corridaNegativa({
    etiqueta: c.etiqueta,
    args: ["--env-file=apps/cms/.env", join(QA, "vacio-legal.mjs")],
    env: c.env,
    cwd: join(QA, "../.."),
    timeout: 600_000,
  });
  const out = (res.stdout || "") + (res.stderr || "");
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  if (res.error || res.status === null) ev.fallo(c.etiqueta, res.error || "no llegó a correr");
  else ev.ok();

  let mal = null;
  if (c.exit !== undefined && res.status !== c.exit) mal = `esperaba exit ${c.exit}, salió ${res.status}`;
  if (!mal && c.salidaTiene && !c.salidaTiene.test(out)) mal = `la salida no contiene ${c.salidaTiene}`;
  if (!mal && c.comprueba) {
    if (!existsSync(fichero)) mal = `no congeló ${fichero.split(/[\\/]/).pop()}`;
    else mal = c.comprueba(JSON.parse(readFileSync(fichero, "utf8")));
  }

  if (mal) { fallos++; console.log(`  ❌ ${c.etiqueta.padEnd(16)} (${seg}s)  ${mal}`); }
  else console.log(`  ✓  ${c.etiqueta.padEnd(16)} (${seg}s)  cayó por lo suyo: ${c.porQue}`);
}

console.log(
  `\n${fallos === 0 ? "✅" : "❌"} vacio-legal · test en negativo: ${casos.length - fallos}/${casos.length}\n` +
    (fallos === 0
      ? `   El campo distingue las dos cosas en las DOS direcciones, y el ablandamiento\n` +
        `   está estrechado a la colección donde el caso se da.\n`
      : `   El vacío legal NO se puede dar por bueno hasta que esto salga en verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
