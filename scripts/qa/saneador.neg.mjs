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
const { validaHtmlCorpus, HOSTS_PERMITIDOS, ATRIBUTOS_CENSADOS } = await import(`${pathToFileURL(bundle).href}?t=${Date.now()}`);

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
  /* ── §3.1-atributos (2026-08-13) · LOS DOS LADOS ─────────────────────────
   * El censo (`qa:atributos-censo`, 291 páginas · 47 524 aperturas) mide CERO
   * manejadores `on*`, CERO `javascript:` y CERO `data:`, así que rechazar no
   * cuesta contenido servido. Un condicional con un solo lado no está probado:
   * hacen falta el que TIRA y el que PASA.                                   */
  {
    caso: "atributo-onclick",
    entrada: `<p>texto</p><a href="/x" onclick="robar()">pincha</a>`,
    porQue: "un manejador `on*` sobre una etiqueta ADMITIDA se rechaza NOMBRÁNDOLO",
    espera: (v) => (typeof v === "string" && v.includes("onclick") ? null : `no nombró onclick: ${v}`),
  },
  {
    caso: "atributo-onerror-en-img",
    entrada: `<img src="/images/uploads/x.jpg" onerror="alert(1)" alt="x" />`,
    porQue: "`onerror` es la vía que `<script>` bloqueado NO cubría — es la superficie que motivó el censo",
    espera: (v) => (typeof v === "string" && v.includes("onerror") ? null : `no nombró onerror: ${v}`),
  },
  {
    caso: "atributo-legitimo-pasa",
    entrada:
      `<p style="color: #0075c9;" class="x" dir="ltr"><a href="/y" target="_blank" rel="noopener" ` +
      `data-variante="boton" title="t">z</a><img src="/i.jpg" srcset="/i.jpg 1x" sizes="100vw" ` +
      `alt="a" width="10" height="10" decoding="async" data-media="2023/02/i.jpg" /></p>`,
    porQue: "un atributo del censo PASA — sin esta mitad, un validate que rechazara todo aprobaría los otros dos",
    espera: (v) => (v === true ? null : `rechazó atributos censados: ${v}`),
  },
  {
    caso: "script-gana-al-atributo",
    entrada: `<script onerror="x">a</script>`,
    porQue: "el orden del contrato: un `<script>` con `on*` cae por §3.3·T4, que es la regla que de verdad lo prohíbe",
    espera: (v) => (typeof v === "string" && /§3\.3 · T4/.test(v) ? null : `no cayó por T4 sino por: ${v}`),
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

/* ══════════════════════════════════════════════════════════════════════════
 * LA SINCRONÍA CON EL CENSO — la deriva que ya se pagó una vez
 *
 * `ATRIBUTOS_CENSADOS` **es** el censo congelado, así que separarse de él no es
 * una diferencia de opinión: es que uno de los dos está viejo. Se pagó en la
 * misma tanda en que se escribió — la lista salió con **80** porque se leyó la
 * congelada ANTERIOR a incluir `articulos-kb` (`w()` no pisa, la buena fue a un
 * nombre fechado), y el seed de KB murió en el 4.º documento por `loading`.
 *
 * La guarda es de las baratas y evita exactamente eso: **comparar las dos
 * listas**, en los dos sentidos.
 * ═════════════════════════════════════════════════════════════════════════ */
{
  const fCenso = join(QA, "medidas/atributos-censo.json");
  if (!existsSync(fCenso))
    throw new Error(
      "no existe `medidas/atributos-censo.json`: corre `npm run qa:atributos-censo` antes.\n" +
        "  Sin la congelada no se puede comprobar que la whitelist del código sea la medida,\n" +
        "  y una whitelist que nadie compara envejece contra el corpus en silencio.",
    );
  const censo = Object.keys(JSON.parse(readFileSync(fCenso, "utf8")).atributos ?? {});
  const enCodigo = new Set(ATRIBUTOS_CENSADOS);
  const faltan = censo.filter((a) => !enCodigo.has(a));
  const sobran = [...enCodigo].filter((a) => !censo.includes(a));
  if (faltan.length || sobran.length) {
    fallos++;
    console.log(
      `  ❌ SINCRONÍA con el censo    faltan en el código: ${faltan.join(", ") || "—"} · ` +
        `sobran: ${sobran.join(", ") || "—"}`,
    );
  } else {
    console.log(`  ✓  SINCRONÍA con el censo    los ${censo.length} atributos del código SON los medidos`);
  }
}
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
