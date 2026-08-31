// 131.ª · ESCALÓN 2 — LOS 22 BLOQUEOS, CLASIFICADOS Y CON SU ALCANCE
//
// §regla 27: el denominador NO se obtiene re-corriendo el proceso, se DERIVA
// recorriendo TODOS sus ejes. Eso ya lo hace el extractor. Lo que falta es la
// pregunta de ALCANCE: ¿el censo que bloquea se derivó sobre un dominio que
// INCLUYE estos 4 documentos, o sobre otro?
//
// Si es otro, esto es §*una regla derivada sobre un dominio donde el caso NO SE
// DA no esta probada para ese caso: esta SIN PROBAR* — y la salida no es
// «ampliar el censo», sino declararlo con su numero y su evidencia.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const RAIZ = process.cwd();
const MED = join(RAIZ, "scripts/qa/medidas");
const DERIV = join(RAIZ, "docs/research/cola-larga/derivaciones");
const P = (...a) => console.log(...a);

const F = join(MED, "f35-extraido.json");
if (!existsSync(F)) { console.error("PRECONDICION: falta f35-extraido.json (npm run cms:extractor-f35)"); process.exit(1); }
const j = JSON.parse(readFileSync(F, "utf8"));

const C = await import(pathToFileURL(join(RAIZ, "packages/cms-config/src/campos/comunes.ts")).href);

P("=".repeat(78));
P("131.ª · los BLOQUEOS del lote F3-5, con su ALCANCE");
P("=".repeat(78));

/* ── 1 · el reparto por eje, con su denominador (los ceros TAMBIEN) ──────── */
P("\n## 1 · REPARTO POR EJE — los 4, y los ceros con su denominador");
const campos = j.bloqueos.camposHtml;
for (const [eje, v] of Object.entries(j.bloqueos.porEje))
  P(`   ${eje.padEnd(10)} ${String(v.length).padStart(3)} de ${campos} campos HTML`);
P(`   TOTAL      ${String(j.bloqueos.total).padStart(3)}`);

/* ── 2 · los tokens distintos, agrupados ─────────────────────────────────── */
P("\n## 2 · LOS TOKENS DISTINTOS (no las ocurrencias)");
const tokens = {};
for (const [eje, v] of Object.entries(j.bloqueos.porEje)) {
  const s = new Set();
  for (const b of v) for (const h of b.hit) s.add(h);
  tokens[eje] = [...s].sort();
  if (s.size) P(`   ${eje}: ${s.size} distintos → ${[...s].sort().join(", ")}`);
}

/* ── 3 · EL ALCANCE DEL CENSO — la pregunta que decide ───────────────────── */
P("\n## 3 · ¿SOBRE QUÉ DOMINIO se derivó el censo que bloquea?");
const fuente = readFileSync(join(RAIZ, "packages/cms-config/src/campos/comunes.ts"), "utf8");
for (const m of fuente.matchAll(/(\d+)\s*(páginas|paginas|documentos)/g))
  P(`   citado en comunes.ts: «${m[0]}»`);
P(`   ETIQUETAS_CENSADAS ... ${C.ETIQUETAS_CENSADAS?.length ?? "(no exportado)"}`);
P(`   ATRIBUTOS_CENSADOS ... ${C.ATRIBUTOS_CENSADOS?.length ?? "(no exportado)"}`);
P(`   HOSTS_PERMITIDOS ..... ${C.HOSTS_PERMITIDOS?.length ?? "(no exportado)"}`);

/* ── 4 · POR DOCUMENTO Y POR TIPO — donde viven ──────────────────────────── */
P("\n## 4 · DÓNDE VIVEN — por documento y por kind");
const porDoc = {};
const porKind = {};
for (const [eje, v] of Object.entries(j.bloqueos.porEje))
  for (const b of v) {
    porDoc[b.slug] = (porDoc[b.slug] ?? 0) + 1;
    porKind[b.kind] = (porKind[b.kind] ?? 0) + 1;
  }
for (const [k, n] of Object.entries(porDoc).sort((a, b) => b[1] - a[1])) P(`   ${k.padEnd(42)} ${n}`);
P("   ──");
for (const [k, n] of Object.entries(porKind).sort((a, b) => b[1] - a[1])) P(`   ${k.padEnd(42)} ${n}`);

/* ── 5 · CLASIFICACION, sin cubo de sobras (§regla 27) ───────────────────── */
P("\n## 5 · CLASIFICADOS — y cada clase manda un trabajo DISTINTO");
const CLASES = {
  "schema.org": ["itemprop", "itemscope", "itemtype", "content", "meta"],
  "estructura HTML5": ["article", "header", "section", "footer", "aside", "nav"],
  formulario: ["form", "input", "label", "button", "fieldset", "legend", "action", "method", "for"],
  "data-* del constructor": [],
  "aria de tabla": ["aria-colcount", "aria-colindex", "aria-rowcount", "aria-rowindex"],
};
const clasifica = (t) => {
  if (t.startsWith("data-")) return "data-* del constructor";
  for (const [c, xs] of Object.entries(CLASES)) if (xs.includes(t)) return c;
  return "SIN CLASIFICAR";
};
const cubos = {};
for (const [eje, ts] of Object.entries(tokens))
  for (const t of ts) {
    const c = clasifica(t);
    (cubos[c] ??= []).push(`${t} (${eje})`);
  }
for (const [c, xs] of Object.entries(cubos).sort((a, b) => b[1].length - a[1].length))
  P(`   ${c.padEnd(26)} ${String(xs.length).padStart(2)} → ${xs.join(", ")}`);
const sinClasificar = (cubos["SIN CLASIFICAR"] ?? []).length;
P(`\n   ${sinClasificar === 0 ? "✅" : "❌"} SIN CLASIFICAR: ${sinClasificar} (un cubo de sobras es donde se pierden las clases que nadie nombró)`);

P("\n" + "=".repeat(78));
P(`VEREDICTO · ${j.bloqueos.total} bloqueos · ${Object.values(tokens).flat().length} tokens distintos · ${Object.keys(cubos).length} clases`);
P("=".repeat(78));
