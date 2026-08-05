/**
 * TEST EN NEGATIVO del SANEADOR EN ESCRITURA — el `validate` del contrato
 * censado (§3.1 whitelist · §3.3 script · §3.3b allowlist por host).
 * Uso: npm run qa:saneador-neg        (offline)
 *
 * No hay `saneador.mjs`: el saneador ES `validaHtmlCorpus` en
 * `packages/cms-config/src/campos/comunes.ts`, el mismo código que corre el
 * `validate` del alta. Aquí se importa RESUELTO (esbuild), no se re-implementa
 * — dos copias del contrato serían la clase C7 — y se prueba por sus tres
 * guardas, cada una NOMBRANDO lo que rechaza:
 *
 *   · una etiqueta fuera del censo de 43 → rechazada CON SU NOMBRE;
 *   · un host de iframe fuera de la allowlist firmada → rechazado CON SU HOST
 *     (y por `data-src` también: Divi difiere iframes y el `src` llega vacío);
 *   · `<script>` → rechazado (§3.3 · T4);
 *   · y el CONTROL: el corpus REAL transformado (T1–T8) pasa entero. Sin esta
 *     mitad, un validate que rechazara todo aprobaría los sabotajes (F2-1 §5).
 */
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Evaluadas, hoy, QA, w } from "./lib.mjs";

process.env.SIN_CLON = "1";

const require = createRequire(import.meta.url);
const esbuild = require("esbuild");
const RAIZ = join(QA, "../..");

const tmp = join(QA, ".tmp");
mkdirSync(tmp, { recursive: true });
const bundle = join(tmp, "comunes.mjs");
await esbuild.build({
  entryPoints: [join(RAIZ, "packages/cms-config/src/campos/comunes.ts")],
  outfile: bundle,
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  logLevel: "silent",
});
const { validaHtmlCorpus, HOSTS_PERMITIDOS } = await import(`${pathToFileURL(bundle).href}?t=${Date.now()}`);

const casos = [
  {
    caso: "etiqueta-fuera",
    entrada: `<p>texto</p><canvas width="300"></canvas>`,
    porQue: "una etiqueta fuera del censo de 43 se rechaza NOMBRÁNDOLA",
    espera: (v) => (typeof v === "string" && v.includes("<canvas>") ? null : `no nombró <canvas>: ${v}`),
  },
  {
    caso: "host-fuera",
    entrada: `<p>x</p><iframe src="https://intruso.example.com/mapa"></iframe>`,
    porQue: "un host fuera de la allowlist firmada (§3.3b) se rechaza NOMBRÁNDOLO",
    espera: (v) => (typeof v === "string" && v.includes("intruso.example.com") ? null : `no nombró el host: ${v}`),
  },
  {
    caso: "host-fuera-data-src",
    entrada: `<iframe data-src="https://otro-intruso.example.org/x" src=""></iframe>`,
    porQue: "el host se lee también del `data-src` — Divi difiere iframes (precedente a-embeds)",
    espera: (v) => (typeof v === "string" && v.includes("otro-intruso.example.org") ? null : `no miró el data-src: ${v}`),
  },
  {
    caso: "script",
    entrada: `<p>x</p><script>alert(1)</script>`,
    porQue: "`<script>` no entra (§3.3 · T4) — la prohibición previa sigue delante",
    espera: (v) => (typeof v === "string" && /§3\.3 · T4/.test(v) ? null : `no cayó por T4: ${v}`),
  },
  {
    caso: "host-con-www",
    entrada: `<iframe src="https://www.youtube.com/embed/xyz"></iframe>`,
    porQue: "`www.` se normaliza: youtube.com está firmado y el iframe PASA",
    espera: (v) => (v === true ? null : `rechazó un host firmado: ${v}`),
  },
];

console.log(`\n════════ TEST EN NEGATIVO · saneador en escritura ════════`);
console.log(`  ${casos.length} sabotajes contra \`validaHtmlCorpus\` (allowlist firmada: ${HOSTS_PERMITIDOS.length} hosts) + control\n`);

/* El control son los cuerpos REALES transformados: el corpus limpio pasa. */
const TRANSFORMADO = join(RAIZ, "corpus", "transformado");
if (!existsSync(TRANSFORMADO))
  throw new Error("no hay `corpus/transformado/`: corre `npm run cms:extractor` antes — el control de este negativo es el corpus real.");
const ficheros = [];
for (const col of readdirSync(TRANSFORMADO))
  for (const f of readdirSync(join(TRANSFORMADO, col))) ficheros.push(join(TRANSFORMADO, col, f));

const ev = new Evaluadas({ nombre: "saneador-neg", unidad: "casos", minimo: casos.length + ficheros.length });
let fallos = 0;
const resultado = { meta: { fecha: hoy(), control: `${ficheros.length} cuerpos de corpus/transformado` }, casos: [] };

for (const c of casos) {
  const v = validaHtmlCorpus(c.entrada);
  const mal = c.espera(v);
  ev.ok();
  resultado.casos.push({ caso: c.caso, veredicto: v === true ? true : String(v).slice(0, 140), mal });
  if (mal) {
    fallos++;
    console.log(`  ❌ ${c.caso.padEnd(20)} ${mal}`);
  } else console.log(`  ✓  ${c.caso.padEnd(20)} ${c.porQue}`);
}

let rechazados = 0;
for (const f of ficheros) {
  const v = validaHtmlCorpus(readFileSync(f, "utf8"));
  ev.ok();
  if (v !== true) {
    rechazados++;
    if (rechazados <= 5) console.log(`  ❌ CONTROL rechaza ${f.split(/[\\/]/).slice(-2).join("/")}: ${String(v).slice(0, 100)}`);
  }
}
resultado.control = { cuerpos: ficheros.length, rechazados };
if (rechazados) fallos++;
else console.log(`  ✓  CONTROL              los ${ficheros.length} cuerpos transformados del corpus PASAN`);

w("medidas/saneador-neg.json", resultado);

const total = casos.length + 1;
console.log(
  `\n${fallos === 0 ? "✅" : "❌"} saneador · test en negativo: ${total - fallos}/${total}\n` +
    (fallos === 0
      ? `   Rechaza nombrando la etiqueta y el host, mantiene la prohibición de <script>\n` +
        `   y deja pasar el corpus limpio. El \`validate\` del alta ya se puede leer.\n`
      : `   El saneador NO se puede citar hasta que esto salga en verde.\n`),
);
process.exit(fallos === 0 ? 0 : 2);
