// 132.ª · PASO 0 — RE-DERIVAR EL REPARTO DE LA 131.ª Y MEDIR EL ALCANCE DEL CENSO
//
// Tres preguntas, y la tercera es la que el encargo pone sin menú de salidas:
//
//   1 · ¿reproduce el reparto 22 · 30 · 5 · 0? Si no, eso es la tanda.
//   2 · ¿el censo que bloquea se derivó sobre un dominio que INCLUYE los 4
//        documentos del lote? Se contesta POR EL DATO —buscando los slugs en la
//        congelada del censo— no por la prosa de su cabecera, que es lo único
//        del repo que nadie ejecuta (§regla 3).
//   3 · ¿qué hay ya en el repo que conteste parte de esto? Se ENUMERA con su
//        cardinal, incluidos los ceros (§regla 14): «no lo miré» y «no hay» se
//        escriben igual si no se dice.
//
// OFFLINE: no levanta navegador, no toca Postgres, no construye.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const RAIZ = process.cwd();
const MED = join(RAIZ, "scripts/qa/medidas");
const P = (...a) => console.log(...a);

/* ── precondiciones ANTES de nada (§regla 37: no dependen de la medición) ── */
const F35 = join(MED, "f35-extraido.json");
const COMUNES = join(RAIZ, "packages/cms-config/src/campos/comunes.ts");
for (const [q, f] of [["f35-extraido.json", F35], ["comunes.ts", COMUNES]])
  if (!existsSync(f)) { console.error(`PRECONDICION: falta ${q} (${f})`); process.exit(1); }

const j = JSON.parse(readFileSync(F35, "utf8"));
const C = await import(pathToFileURL(COMUNES).href);

P("=".repeat(78));
P("132.ª · PASO 0 — el reparto de la 131.ª, re-derivado, y el ALCANCE del censo");
P("=".repeat(78));

/* ════════════════════════════════════════════════════════════════════════
 * 1 · ¿REPRODUCE? — el reparto de la 131.ª, recalculado desde la congelada
 * ══════════════════════════════════════════════════════════════════════ */
P("\n## 1 · ¿REPRODUCE EL REPARTO DE LA 131.ª?");

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

const porEje = j.bloqueos.porEje;
const tokensPorEje = {};
for (const [eje, v] of Object.entries(porEje)) {
  const s = new Set();
  for (const b of v) for (const h of b.hit) s.add(h);
  tokensPorEje[eje] = [...s].sort();
}
const tokensTodos = Object.values(tokensPorEje).flat();
const clasesVistas = new Set(tokensTodos.map(clasifica));
const sinClasificar = tokensTodos.filter((t) => clasifica(t) === "SIN CLASIFICAR");

const esperado = { bloqueos: 22, tokens: 30, clases: 5, sinClasificar: 0 };
const obtenido = {
  bloqueos: j.bloqueos.total,
  tokens: tokensTodos.length,
  clases: clasesVistas.size,
  sinClasificar: sinClasificar.length,
};
let reproduce = true;
for (const k of Object.keys(esperado)) {
  const ok = esperado[k] === obtenido[k];
  if (!ok) reproduce = false;
  P(`   ${ok ? "✅" : "❌"} ${k.padEnd(16)} 131.ª ${String(esperado[k]).padStart(3)}  ·  hoy ${String(obtenido[k]).padStart(3)}`);
}
P(`\n   ${reproduce ? "✅ REPRODUCE" : "❌ NO REPRODUCE — eso es la tanda"}`);

/* ════════════════════════════════════════════════════════════════════════
 * 2 · EL ALCANCE — por el DATO, no por la prosa de la cabecera
 * ══════════════════════════════════════════════════════════════════════ */
P("\n## 2 · ¿EL CENSO QUE BLOQUEA INCLUYE EL LOTE? — por el dato");

const SLUGS_LOTE = [...new Set(
  Object.values(porEje).flat().map((b) => b.slug)
)].sort();
P(`   los ${SLUGS_LOTE.length} documentos del lote: ${SLUGS_LOTE.join(" · ")}`);

/**
 * Se resuelve la congelada del censo por `mtime` y descartando artefactos
 * (§regla 5: el nombre canónico conserva la PRIMERA foto; §regla 7: un
 * `-neg-`/`SABOTAJE`/`SONDA-` es un artefacto, no una medida).
 */
const ES_ARTEFACTO = /(^|[-.])(neg|SABOTAJE|SONDA)[-.]/;
function eligeCongelada(prefijo) {
  const cands = readdirSync(MED)
    .filter((f) => f.startsWith(prefijo) && f.endsWith(".json") && !ES_ARTEFACTO.test(f))
    .map((f) => ({ f, t: statSync(join(MED, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t || a.f.localeCompare(b.f)); // §regla 38: desempate NOMBRADO
  return cands[0] ?? null;
}

const censoAtr = eligeCongelada("atributos-censo");
if (!censoAtr) { console.error("PRECONDICION: no hay congelada de atributos-censo"); process.exit(1); }
P(`\n   congelada resuelta por mtime: ${censoAtr.f}  (${new Date(censoAtr.t).toISOString().slice(0, 19)})`);
const ca = JSON.parse(readFileSync(join(MED, censoAtr.f), "utf8"));
P(`   su alcance DECLARADO: ${ca.meta?.alcance ?? "(sin declarar)"}`);
P(`   su recuento: ${JSON.stringify(ca.recuento)}`);

const blobCenso = JSON.stringify(ca);
P("\n   ¿aparece cada documento del lote DENTRO de esa congelada?");
const dentro = [];
const fuera = [];
for (const s of SLUGS_LOTE) (blobCenso.includes(s) ? dentro : fuera).push(s);
for (const s of SLUGS_LOTE) P(`     ${blobCenso.includes(s) ? "PRESENTE" : "AUSENTE "}  ${s}`);
P(`\n   → dentro ${dentro.length} de ${SLUGS_LOTE.length}  ·  FUERA ${fuera.length} de ${SLUGS_LOTE.length}`);

/* La cita de la prosa contra el dato de la congelada — §regla 9 sobre un
 * comentario, que es lo único del repo que nadie ejecuta. */
const fuente = readFileSync(COMUNES, "utf8");
const citadas = [...fuente.matchAll(/\*\s.*?(\d[\d\s]*)\s*páginas/g)].map((m) => m[1].trim());
P(`\n   páginas CITADAS en la cabecera del censo de atributos: ${citadas.join(" · ")}`);
P(`   páginas MEDIDAS en la congelada .................... ${ca.recuento?.paginas}`);
P(`   ${citadas.includes(String(ca.recuento?.paginas)) ? "✅ concuerdan" : "⚠ la prosa cita un número que la congelada no da (§regla 9)"}`);

P(`\n   ETIQUETAS_CENSADAS ${C.ETIQUETAS_CENSADAS.length} · ATRIBUTOS_CENSADOS ${C.ATRIBUTOS_CENSADOS.length} · HOSTS_PERMITIDOS ${C.HOSTS_PERMITIDOS.length}`);

/* ════════════════════════════════════════════════════════════════════════
 * 3 · QUÉ HAY YA EN EL REPO — con su cardinal, los ceros incluidos
 * ══════════════════════════════════════════════════════════════════════ */
P("\n## 3 · QUÉ HAY YA EN EL REPO QUE CONTESTE PARTE DE ESTO");

const BUSCADO = [
  ["censo de ATRIBUTOS (congeladas)", "atributos-censo"],
  ["censo de ETIQUETAS del arquetipo A", "a-censo"],
  ["censo de HOSTS de iframe · grupo A", "a-embeds"],
  ["censo de HOSTS de iframe · grupo C", "c-embeds"],
  ["extraído del lote F3-5", "f35-extraido"],
];
for (const [que, pref] of BUSCADO) {
  const n = readdirSync(MED).filter((f) => f.startsWith(pref) && f.endsWith(".json")).length;
  const art = readdirSync(MED).filter((f) => f.startsWith(pref) && f.endsWith(".json") && ES_ARTEFACTO.test(f)).length;
  P(`   ${que.padEnd(38)} ${String(n).padStart(3)} congeladas (${art} artefactos)`);
}

/* El precedente: ¿se ha ampliado ya alguna de las tres listas? */
P("\n   PRECEDENTE de ampliación — tramos declarados en las listas:");
const tramos = [...fuente.matchAll(/──\s*Tramo\s+(\w+)[^\n]*/g)].map((m) => m[0].replace(/\s+/g, " ").trim());
if (tramos.length) for (const t of tramos) P(`     ${t}`);
else P("     (0 tramos declarados)");

P("\n" + "=".repeat(78));
P(`VEREDICTO · reparto ${reproduce ? "REPRODUCE" : "NO REPRODUCE"} (${obtenido.bloqueos}·${obtenido.tokens}·${obtenido.clases}·${obtenido.sinClasificar})`);
P(`           · el lote está FUERA del censo en ${fuera.length} de ${SLUGS_LOTE.length} documentos`);
P("=".repeat(78));

process.exit(reproduce ? 0 : 1);
