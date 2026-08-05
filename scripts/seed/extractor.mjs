/**
 * EL EXTRACTOR DEL CORPUS — de la captura congelada al cuerpo importable.
 * Uso: npm run cms:extractor        (SABOTAJE=t1…t8 → test en negativo)
 *
 * ── Qué hace, y sobre qué ──────────────────────────────────────────────────
 * Lee `corpus/` (la captura congelada y COMMITEADA — nunca el sitio vivo),
 * extrae el `post_content` de las tres colecciones del grupo A y le aplica
 * **T1–T8** (§3.2) en su orden de contrato. El resultado va a
 * `corpus/transformado/` (derivable: NO se commitea; se regenera de captura +
 * código) y el informe congela en `medidas/extractor-corpus.json`.
 *
 * casos · faqs · productos están CAPTURADOS pero NO se extraen aquí: son
 * páginas de builder (su contenido no vive en un `post_content`) y su
 * extracción a bloques es otra mecánica — queda declarado en el informe y en
 * el HANDOFF, no omitido.
 *
 * ── Las tres guardas que cierran el código de salida ───────────────────────
 * 1 · POSTCONDICIÓN por transformación, evaluada EN SU ETAPA (T8 se comprueba
 *     antes de que T4a se lleve los scripts — en el HTML final sería vacua);
 * 2 · `<script>` SIN CLASIFICAR = el censo §3.3 no lo contempla → rojo;
 * 3 · el contrato del saneador (§3.1 whitelist · §3.3b allowlist · sin script)
 *     sobre CADA cuerpo transformado, con `validaHtmlCorpus` — el MISMO código
 *     que corre el `validate` del alta, importado, no copiado (clase C7).
 *
 * Y la lectura del censo de julio contra la captura de hoy: etiquetas u hosts
 * del cuerpo CRUDO (sin <script>/<style>, la regla del markup) que el censo no
 * tenga salen NOMBRADOS — el original es un sitio vivo y la contradicción es
 * un dato, no un error de la sonda.
 */
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path, { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { enApp, Evaluadas, hoy, QA, w } from "../qa/lib.mjs";
import { TRANSFORMACIONES } from "./transformaciones.mjs";

process.env.SIN_CLON = "1"; // lee ficheros congelados: un build del clon no la contamina

const require = createRequire(import.meta.url);
const esbuild = require("esbuild");

const RAIZ = join(QA, "../..");
const CORPUS = join(RAIZ, "corpus");
const SABOTAJE = process.env.SABOTAJE || null;
const VALIDOS = TRANSFORMACIONES.map((t) => t.id);
if (SABOTAJE && !VALIDOS.includes(SABOTAJE))
  throw new Error(`SABOTAJE desconocido: '${SABOTAJE}' (${VALIDOS.join(" | ")})`);
if (SABOTAJE) console.log(`\n⚠ SABOTAJE=${SABOTAJE} — la transformación NO se aplica. Su postcondición DEBE morder.\n`);

/* ── el contrato del saneador: importado de la config, no copiado ────────── */
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
const { validaHtmlCorpus, etiquetasFueraDelCenso, hostsFueraDeAllowlist } = await import(
  `${pathToFileURL(bundle).href}?t=${Date.now()}`
);

/* ── la captura y la lista de trabajo (derivadas, no escritas) ───────────── */
const INDICE = JSON.parse(readFileSync(join(CORPUS, "INDICE.json"), "utf8"));
const DEL_GRUPO_A = ["entradas-blog", "terminos-kunakpedia", "documentos-cientificos"];
const FUERA = ["casos", "faqs", "productos"]; // capturadas; extracción de builder = otra mecánica
const trabajo = Object.entries(INDICE.paginas).filter(([clave]) => DEL_GRUPO_A.includes(clave.split("/")[0]));

/* ── las rutas publicadas, para T7: manifest del build + el propio corpus ── */
const rutas = new Set();
const manifest = enApp(".next/prerender-manifest.json");
if (!existsSync(manifest))
  throw new Error("no hay `prerender-manifest.json`: sin build no hay conjunto de rutas publicadas para T7 (regla del cero — 0 rutas daría un T7 «limpio» que no miró nada).");
for (const r of Object.keys(JSON.parse(readFileSync(manifest, "utf8")).routes ?? {})) rutas.add(r);
for (const p of Object.values(INDICE.paginas)) {
  const camino = new URL(p.url).pathname.replace(/^\/es/, "").replace(/\/$/, "");
  rutas.add(camino === "" ? "/" : camino);
}

/* ── el cuerpo: el interior de `et_pb_post_content` ──────────────────────── */
function interiorDiv(html, desde) {
  const fin = html.indexOf(">", desde);
  if (fin < 0) return null;
  const re = /<(\/?)div\b/gi;
  re.lastIndex = fin + 1;
  let nivel = 1, m;
  while ((m = re.exec(html))) {
    nivel += m[1] ? -1 : 1;
    if (nivel === 0) return html.slice(fin + 1, m.index);
  }
  return null;
}
const postContent = (html) => {
  const i = html.search(/<div[^>]*\bclass="[^"]*\bet_pb_post_content\b[^"]*"/i);
  return i < 0 ? null : interiorDiv(html, i);
};
/** La regla del markup: se busca sobre el HTML sin `<script>` ni `<style>`. */
const sinScriptNiStyle = (html) =>
  html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, "");

console.log(`\n════════ EXTRACTOR · ${trabajo.length} cuerpos del grupo A · T1–T8 ════════`);
console.log(`  fuera de esta extracción (capturadas, builder): ${FUERA.join(" · ")}\n`);

const ev = new Evaluadas({ nombre: "extractor", unidad: "cuerpos", minimo: trabajo.length });

const porT = Object.fromEntries(VALIDOS.map((id) => [id, { aplicadas: 0, dianas: 0, violaciones: [] }]));
const scriptsQuitados = [];
const censoContradicho = { etiquetas: new Map(), hosts: new Map() };
const rechazosSaneador = [];
const sinCuerpo = [];
const paginas = {};

for (const [clave, p] of trabajo) {
  const crudo = readFileSync(join(CORPUS, p.fichero), "utf8");
  const cuerpo = postContent(crudo);
  if (cuerpo === null) {
    sinCuerpo.push(clave);
    ev.fallo(clave, "sin et_pb_post_content");
    continue;
  }

  /* el censo de julio contra la captura de hoy, sobre el cuerpo CRUDO */
  const legible = sinScriptNiStyle(cuerpo);
  for (const t of etiquetasFueraDelCenso(legible)) {
    if (!censoContradicho.etiquetas.has(t)) censoContradicho.etiquetas.set(t, []);
    censoContradicho.etiquetas.get(t).push(clave);
  }
  for (const h of hostsFueraDeAllowlist(legible)) {
    if (!censoContradicho.hosts.has(h)) censoContradicho.hosts.set(h, []);
    censoContradicho.hosts.get(h).push(clave);
  }

  /* T1–T8, cada una con su diana y su postcondición EN SU ETAPA */
  const ctx = { pagina: clave, rutas, scriptsQuitados };
  let html = cuerpo;
  const aplicado = {};
  for (const t of TRANSFORMACIONES) {
    const diana = t.diana(html, ctx);
    porT[t.id].dianas += diana;
    if (SABOTAJE !== t.id) {
      const r = t.aplica(html, ctx);
      html = r.html;
      porT[t.id].aplicadas += r.n;
      aplicado[t.id] = r.n;
    }
    for (const v of t.post(html, ctx)) porT[t.id].violaciones.push(`${clave}: ${v}`);
  }

  /* el contrato del alta, con el MISMO código que el `validate` */
  const veredicto = validaHtmlCorpus(html);
  if (veredicto !== true) rechazosSaneador.push({ pagina: clave, veredicto });

  if (!SABOTAJE) {
    const destino = join(CORPUS, "transformado", `${clave}.html`);
    mkdirSync(dirname(destino), { recursive: true });
    writeFileSync(destino, html);
  }
  paginas[clave] = { bytes: Buffer.byteLength(cuerpo), bytesTransformado: Buffer.byteLength(html), ...aplicado };
  ev.ok();
}

/* ════════════════════════════════ informe ════════════════════════════════ */
let rojo = 0;

console.log(`  transformación                aplicadas   dianas`);
for (const t of TRANSFORMACIONES) {
  const e = porT[t.id];
  console.log(`   ${t.id.padEnd(4)} ${t.titulo.slice(5, 60).padEnd(58)} ${String(e.aplicadas).padStart(6)} ${String(e.dianas).padStart(8)}`);
}

for (const t of TRANSFORMACIONES) {
  const e = porT[t.id];
  if (!e.violaciones.length) continue;
  rojo++;
  console.error(
    `\n❌ ${t.id.toUpperCase()} POSTCONDICIÓN — ${e.violaciones.length} violación(es):\n` +
      e.violaciones.slice(0, 6).map((v) => `     · ${v}`).join("\n"),
  );
}
if (SABOTAJE && porT[SABOTAJE].dianas === 0 && !porT[SABOTAJE].violaciones.length) {
  console.error(
    `\n❌ SABOTAJE=${SABOTAJE} SIN DIANA — el corpus no trae el patrón de esta transformación,\n` +
      `   así que desactivarla no cambia nada (regla 8a). No se lee como verde.`,
  );
  rojo++;
}

const sinClasificar = scriptsQuitados.filter((s) => s.clase === "SIN CLASIFICAR");
if (sinClasificar.length) {
  rojo++;
  console.error(
    `\n❌ ${sinClasificar.length} <script> SIN CLASIFICAR — el censo §3.3 no los contempla:\n` +
      sinClasificar.slice(0, 6).map((s) => `     · ${s.pagina}: ${s.muestra.slice(0, 80)}`).join("\n"),
  );
}
if (sinCuerpo.length) rojo++;
if (rechazosSaneador.length) {
  rojo++;
  console.error(
    `\n❌ EL SANEADOR RECHAZA ${rechazosSaneador.length} cuerpo(s) TRANSFORMADO(s):\n` +
      rechazosSaneador.slice(0, 6).map((r) => `     · ${r.pagina}: ${r.veredicto.slice(0, 110)}`).join("\n"),
  );
}
if (censoContradicho.etiquetas.size || censoContradicho.hosts.size) {
  console.log(`\n⚠ LA CAPTURA CONTRADICE EL CENSO DE JULIO (dato, no error — va al ESQUEMA):`);
  for (const [t, pags] of censoContradicho.etiquetas)
    console.log(`   · etiqueta <${t}> en ${pags.length} página(s): ${pags.slice(0, 3).join(", ")}`);
  for (const [h, pags] of censoContradicho.hosts)
    console.log(`   · host ${h} en ${pags.length} página(s): ${pags.slice(0, 3).join(", ")}`);
}

const t4b = scriptsQuitados.filter((s) => s.clase !== "SIN CLASIFICAR");
if (t4b.length) {
  console.log(`\n  T4a se llevó ${t4b.length} <script> — T4b (la sustitución) SIGUE PENDIENTE en cada uno:`);
  for (const s of t4b) console.log(`   · ${s.pagina}  [${s.clase}]`);
}

w("medidas/extractor-corpus.json", {
  meta: {
    fecha: hoy(),
    sabotaje: SABOTAJE,
    fuente: "corpus/ (captura congelada) — OFFLINE, sin tocar el sitio vivo",
    alcance: `${trabajo.length} cuerpos de ${DEL_GRUPO_A.join(" · ")}; fuera (builder): ${FUERA.join(" · ")}`,
    rutasParaT7: rutas.size,
  },
  porT: Object.fromEntries(Object.entries(porT).map(([id, e]) => [id, { aplicadas: e.aplicadas, dianas: e.dianas, violaciones: e.violaciones }])),
  scriptsQuitados,
  censoContradicho: {
    etiquetas: Object.fromEntries(censoContradicho.etiquetas),
    hosts: Object.fromEntries(censoContradicho.hosts),
  },
  rechazosSaneador,
  sinCuerpo,
  paginas,
});

console.log(
  `\n${rojo === 0 ? "✅" : "❌"} extractor: ${trabajo.length - sinCuerpo.length}/${trabajo.length} cuerpos · ` +
    `${rojo === 0 ? "8/8 postcondiciones limpias y el saneador admite el corpus transformado" : `${rojo} guarda(s) en rojo`}\n`,
);
process.exit(rojo === 0 ? 0 : 2);
