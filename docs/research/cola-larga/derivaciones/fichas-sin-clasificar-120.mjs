/**
 * LAS 165 SIN CLASIFICAR · ¿HAY UN CANAL QUE CLASIFIQUE POR CONSTRUCCIÓN?
 * Uso: node docs/research/cola-larga/derivaciones/fichas-sin-clasificar-120.mjs
 *
 * ── El encargo ──────────────────────────────────────────────────────────────
 *
 * El censo de la 119.ª clasificó por el MARCADOR DE CABECERA (⛔/✅) y dejó
 * **165 de 314** sin clasificar: 102 `⚠` + 63 sin marcador. Se intentó un
 * heurístico sobre el cuerpo y **su control lo rechazó** (41.4 %), así que no se
 * usó — bien hecho: un discriminador que no acierta sobre el conjunto conocido
 * no se aplica al desconocido.
 *
 * **La pregunta de esta derivación NO es «afinemos el heurístico».** Es: ¿existe
 * un canal que clasifique **POR CONSTRUCCIÓN** en vez de por parecido? Un canal
 * por construcción es el que **sólo puede estar ahí si el hecho es cierto** —una
 * palabra de estado escrita a propósito, una sonda citada— frente a uno que
 * *sugiere* el estado.
 *
 * ⚠ Y lleva el mismo control que hundió al heurístico: se mide **sobre el
 * conjunto CONOCIDO** (⛔ y ✅) antes de tocar el desconocido. Si no acierta ahí,
 * no se usa — y la salida es el número declarado, que ya está.
 */
import { readFileSync, writeFileSync } from "node:fs";

const DOC = new URL("../../../PENDIENTES-QA.md", import.meta.url).pathname
  .replace(/^\/([A-Za-z]:)/, "$1");
const txt = readFileSync(DOC, "utf8");

/* ── 1 · las fichas: toda sección `## …` con su cuerpo ── */
const lineas = txt.split(/\r?\n/);
const fichas = [];
let actual = null;
for (const l of lineas) {
  if (/^## /.test(l)) {
    if (actual) fichas.push(actual);
    actual = { cabecera: l, cuerpo: [] };
  } else if (actual) actual.cuerpo.push(l);
}
if (actual) fichas.push(actual);

const marcador = (c) =>
  /^## ⛔/.test(c) ? "⛔" : /^## ✅/.test(c) ? "✅" : /^## (⚠|📋)/.test(c) ? "⚠" : "—";

for (const f of fichas) {
  f.marca = marcador(f.cabecera);
  f.texto = f.cuerpo.join("\n");
}

/* ── 2 · los canales POR CONSTRUCCIÓN candidatos ── */
/** Palabra de estado escrita a propósito en la CABECERA. */
const RE_CERRADA_CAB = /\b(CERRADA|CERRADO|RESUELTA|RESUELTO|DISUELT[AO])\b/i;
const RE_ABIERTA_CAB = /\b(FICHAD[AO]|ABIERTA|PENDIENTE|SIN DIAGNOSTICAR|SIN PROBAR)\b/i;

const canales = {
  "cabecera: palabra de estado": (f) =>
    RE_CERRADA_CAB.test(f.cabecera) ? "CERRADA" : RE_ABIERTA_CAB.test(f.cabecera) ? "ABIERTA" : null,
  "cuerpo: ✅ CERRADA / ⛔ al inicio de línea": (f) => {
    const cerr = (f.texto.match(/^>?\s*✅ \*\*CERRAD[AO]/gm) || []).length;
    const abre = (f.texto.match(/^>?\s*⛔/gm) || []).length;
    if (cerr && !abre) return "CERRADA";
    if (abre && !cerr) return "ABIERTA";
    return null;
  },
};

/* ── 3 · CONTROL sobre el conjunto conocido, antes de tocar el desconocido ── */
const conocido = fichas.filter((f) => f.marca === "⛔" || f.marca === "✅");
const esperado = (f) => (f.marca === "⛔" ? "ABIERTA" : "CERRADA");

console.log(`\n═══ EL UNIVERSO\n`);
const porMarca = {};
for (const f of fichas) porMarca[f.marca] = (porMarca[f.marca] || 0) + 1;
console.log(`  fichas (secciones \`## \`) ....... ${fichas.length}`);
for (const [m, n] of Object.entries(porMarca)) console.log(`    ${m}  ${n}`);
console.log(`  conjunto CONOCIDO (⛔ + ✅) ..... ${conocido.length}`);
const desconocido = fichas.filter((f) => f.marca === "⚠" || f.marca === "—");
console.log(`  conjunto DESCONOCIDO (⚠ + —) ... ${desconocido.length}`);

console.log(`\n═══ CONTROL DE CADA CANAL, SOBRE EL CONOCIDO\n`);
console.log(`  canal                                     se moja  acierta   %`);
const resultado = {};
for (const [nombre, fn] of Object.entries(canales)) {
  let moja = 0, ok = 0;
  for (const f of conocido) {
    const v = fn(f);
    if (!v) continue;
    moja++;
    if (v === esperado(f)) ok++;
  }
  const pct = moja ? (100 * ok / moja) : 0;
  resultado[nombre] = { moja, ok, pct: +pct.toFixed(1) };
  console.log("  " + nombre.padEnd(42) + String(moja).padStart(6) + String(ok).padStart(9) + pct.toFixed(1).padStart(7));
}

/* ── 4 · el veredicto, con el listón declarado ANTES ── */
const LISTON = 90; // un canal por construcción o acierta casi siempre, o no lo es
console.log(`\n═══ VEREDICTO — listón declarado antes de mirar: ${LISTON} %\n`);
const usables = Object.entries(resultado).filter(([, r]) => r.moja >= 10 && r.pct >= LISTON);
if (!usables.length) {
  console.log(`  ❌ NINGÚN canal supera el listón sobre el conjunto conocido.`);
  console.log(`     La salida es el número declarado: las 165 siguen SIN CLASIFICAR,`);
  console.log(`     y eso es alcance conocido, no deuda nueva.`);
} else {
  console.log(`  ✅ ${usables.length} canal(es) por construcción superan el listón:`);
  let ganados = 0;
  for (const [n, r] of usables) {
    const aplica = desconocido.filter((f) => canales[n](f)).length;
    ganados += aplica;
    console.log(`     ${n} — ${r.ok}/${r.moja} (${r.pct} %) · clasificaría ${aplica} del desconocido`);
  }
  console.log(`\n  ⚠ «clasificaría N» NO es «clasificadas»: aplicarlo es otra tanda,`);
  console.log(`     y el listón se evalúa UNA vez (§regla 39).`);
}

writeFileSync(
  new URL("./fichas-sin-clasificar-120.json", import.meta.url),
  JSON.stringify({
    meta: { fecha: "2026-08-27", tanda: "120.ª ESCALÓN 3", liston: LISTON },
    universo: { fichas: fichas.length, porMarca, conocido: conocido.length, desconocido: desconocido.length },
    canales: resultado,
    veredicto: usables.length ? "hay canal" : "ningun canal supera el liston",
  }, null, 1),
  "utf8",
);
console.log(`\n→ derivaciones/fichas-sin-clasificar-120.json`);
