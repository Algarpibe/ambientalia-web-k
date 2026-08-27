/**
 * LA COBERTURA REAL DE FIDELIDAD · qué parte de las 426 se ha comparado CONTRA
 * EL ORIGINAL, y qué costaría el hueco
 * Uso: node docs/research/cola-larga/derivaciones/cobertura-fidelidad-120.mjs
 *      (offline: lee el manifiesto y las congeladas)
 *
 * ── Las cuatro preguntas del ESCALÓN 2 ──────────────────────────────────────
 *
 *  1. ¿qué comparadores de DOS LADOS existen? → `matriz-comparadores-120`
 *  2. ¿cuántas de las 426 han pasado por alguno? ← AQUÍ, con su cardinal
 *  3. ¿cuánto cuesta el hueco? ← el original NO es estable: el precio no es
 *     lineal en rutas, y se paga en CAMPAÑAS DE RUIDO, no en corridas
 *  4. ¿hacen falta las 426 o un conjunto que las REPRESENTE? ← el reparto por
 *     familia de ruta (misma `page.tsx` = misma plantilla)
 *
 * ⚠ Lo que esta derivación NO hace: adjudicar fidelidad. Que una ruta haya sido
 * comparada alguna vez **no** dice que esté limpia — dice que existe medida. Es
 * cobertura, no veredicto (§COBERTURA-MEDICION: *«la diferencia entre "no hay
 * defecto conocido" y "no se ha mirado"»*).
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("../../../../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const MED = join(RAIZ, "scripts/qa/medidas");
const yaMarcado = (n) => /-neg-|SABOTAJE|SONDA-/.test(n);
const leer = (n) => { try { return JSON.parse(readFileSync(join(MED, n), "utf8")); } catch { return null; } };

/* ── el universo: las rutas del BUILD, no una lista ── */
const man = JSON.parse(readFileSync(join(RAIZ, "apps/web/.next/prerender-manifest.json"), "utf8"));
const RUTAS = Object.keys(man.routes || {})
  .filter((r) => !r.startsWith("/_") && !r.split("/").pop().includes("."));
const SET = new Set(RUTAS);

/* ── quién es comparador: la matriz de la derivación hermana ── */
const matriz = JSON.parse(readFileSync(new URL("./matriz-comparadores-120.json", import.meta.url), "utf8"));
/* Los que su propia congelada declara de UN solo lado quedan FUERA. */
const unLado = new Set();
for (const c of matriz.comparadores) {
  const o = c.congelada ? leer(c.congelada) : null;
  const lado = o?.meta?.lado;
  if (typeof lado === "string" && /^UNO/.test(lado)) unLado.add(c.sonda);
}
const COMPARADORES = matriz.comparadores.filter((c) => !unLado.has(c.sonda));

/* ── qué rutas tocó cada uno: se lee de TODAS sus congeladas, no de la última ── */
/*
 * ⚠ LA v1 DE ESTE EXTRACTOR SACABA 0 RUTAS DE `c-cabecera`, QUE DECLARA 31.
 *
 * Un cero que contradice una medida buena anterior es del instrumento (§sondas 4).
 * Aquí eran DOS defectos, y ninguno daba error:
 *
 *   · `c-cabecera.paginas` es un OBJETO cuyas **CLAVES** son las rutas. El
 *     walker sólo recorría VALORES, así que no veía ni una;
 *   · las congeladas de `ruido` usan claves **truncadas a 16 caracteres** con el
 *     ancho pegado —`software-de-medi@1440`—, así que no casan con ninguna ruta
 *     por igualdad. Se resuelven por PREFIJO, y eso se declara.
 */
const RE_RUTA = /^\/[\w\-./[\]]*$/;
const norm = (s) => s.replace(/^\/es(?=\/|$)/, "").replace(/\/$/, "") || "/";
function rutasDe(o, prof = 0) {
  const out = new Set();
  if (!o || prof > 5) return out;
  if (typeof o === "string") { if (RE_RUTA.test(o)) out.add(norm(o)); return out; }
  if (Array.isArray(o)) { for (const x of o) for (const r of rutasDe(x, prof + 1)) out.add(r); return out; }
  if (typeof o === "object")
    for (const [k, v] of Object.entries(o)) {
      if (k === "meta") continue;
      if (RE_RUTA.test(k)) out.add(norm(k)); // ← las CLAVES también son rutas
      for (const r of rutasDe(v, prof + 1)) out.add(r);
    }
  return out;
}

/** Claves truncadas tipo `software-de-medi@1440` → la ruta que empieza así. */
function porPrefijoTruncado(clave, universo) {
  const base = String(clave).split("@")[0];
  if (base.length < 8) return null;
  const cands = universo.filter((r) => r.slice(1).startsWith(base));
  return cands.length === 1 ? cands[0] : null;
}

const todas = readdirSync(MED).filter((n) => n.endsWith(".json") && !yaMarcado(n));
const porSonda = {};
for (const c of COMPARADORES) {
  const suyas = todas.filter((n) => n === `${c.sonda}.json` || n.startsWith(`${c.sonda}-`));
  const set = new Set();
  for (const n of suyas) for (const r of rutasDe(leer(n))) if (SET.has(r)) set.add(r);
  porSonda[c.sonda] = { n: set.size, rutas: set, congeladas: suyas.length, lado: c.ladoOriginal.join("+") };
}

const union = new Set();
for (const s of Object.values(porSonda)) for (const r of s.rutas) union.add(r);

/* ── control: si la unión sale 0 o 426, el extractor no discrimina ── */
console.log(`\n═══ 1 · COBERTURA DE FIDELIDAD SOBRE LAS ${RUTAS.length} RUTAS DEL BUILD\n`);
if (union.size === 0 || union.size === RUTAS.length) {
  console.error(`❌ unión = ${union.size} de ${RUTAS.length}: el extractor no discrimina. Corrida NULA.`);
  process.exitCode = 1;
}
console.log(`  comparadores de dos lados ............. ${COMPARADORES.length}`);
console.log(`  (excluidos por declararse de UN lado) . ${unLado.size}  ${[...unLado].join(", ") || "—"}`);
console.log(`  RUTAS tocadas por alguno (unión) ...... ${union.size} de ${RUTAS.length}  (${(100 * union.size / RUTAS.length).toFixed(1)} %)`);
console.log(`  RUTAS que NUNCA se compararon ......... ${RUTAS.length - union.size}  (${(100 * (RUTAS.length - union.size) / RUTAS.length).toFixed(1)} %)`);

console.log(`\n  sonda                     lado           congeladas   rutas tocadas`);
for (const [s, v] of Object.entries(porSonda).sort((a, b) => b[1].n - a[1].n))
  console.log("  " + s.padEnd(26) + v.lado.padEnd(15) + String(v.congeladas).padStart(10) + String(v.n).padStart(16));

/* ── 2 · el reparto por FAMILIA: ¿hacen falta las 426? ── */
const manif = (() => {
  const c = todas.filter((n) => /^manifiesto/.test(n))
    .map((n) => ({ n, m: statSync(join(MED, n)).mtimeMs })).sort((a, b) => b.m - a.m)[0];
  return c ? { fichero: c.n, o: leer(c.n) } : null;
})();
const familias = manif?.o?.familias || {};
console.log(`\n═══ 2 · EL REPARTO POR FAMILIA (misma \`page.tsx\` = misma plantilla)\n`);
console.log(`  fuente: ${manif?.fichero} · ${Object.keys(familias).length} familias`);
const filasFam = Object.entries(familias)
  .map(([f, n]) => {
    const suyas = [...union].filter((r) => perteneceA(r, f, familias));
    return { familia: f, rutas: n, cubiertas: suyas.length };
  })
  .sort((a, b) => b.rutas - a.rutas);
console.log(`\n  familia                              rutas   cubiertas`);
for (const f of filasFam.slice(0, 14))
  console.log("  " + f.familia.padEnd(36) + String(f.rutas).padStart(6) + String(f.cubiertas).padStart(12));
const sinCubrir = filasFam.filter((f) => f.cubiertas === 0);
console.log(`\n  familias con CERO rutas cubiertas: ${sinCubrir.length} de ${filasFam.length}`);
if (sinCubrir.length) console.log("   " + sinCubrir.map((f) => `${f.familia}(${f.rutas})`).join(" · "));

function perteneceA(ruta, patron) {
  if (!patron.includes("[")) return ruta === patron;
  const re = new RegExp("^" + patron.replace(/\[\.\.\.[^\]]+\]/g, ".+").replace(/\[[^\]]+\]/g, "[^/]+") + "$");
  return re.test(ruta);
}

/* ── 3 · el precio: campañas de ruido CERRADAS ── */
const ruido = todas.filter((n) => /^ruido/.test(n));
const rutasConCampana = new Set();
for (const n of ruido) {
  const o = leer(n);
  for (const r of rutasDe(o)) if (SET.has(r)) rutasConCampana.add(r);
  /* y las claves truncadas `slug@ancho`, que no casan por igualdad */
  for (const k of Object.keys(o || {})) {
    const r = porPrefijoTruncado(k, RUTAS);
    if (r) rutasConCampana.add(r);
  }
}
/* Control: `ruido-cqa6` cubre 3 rutas conocidas. Si sale 0, el extractor falla. */
if (ruido.length && rutasConCampana.size === 0) {
  console.error(`\n❌ ${ruido.length} congeladas de ruido y CERO rutas casadas: el extractor falla (las claves van truncadas).`);
  process.exitCode = 1;
}
console.log(`\n═══ 3 · EL PRECIO — el original NO es un objetivo estable\n`);
console.log(`  congeladas de \`ruido\` .................. ${ruido.length}`);
console.log(`  rutas con campaña de ruido (alguna) .... ${rutasConCampana.size} de ${RUTAS.length}  (${(100 * rutasConCampana.size / RUTAS.length).toFixed(1)} %)`);
console.log(`  rutas SIN campaña ...................... ${RUTAS.length - rutasConCampana.size}`);
console.log(`\n  ⚠ Sin campaña cerrada, un residuo pequeño NO es «limpio»: es SIN PROBAR.`);
console.log(`     Y hay rutas con suelo BIMODAL (±32.28 a 1440, ±30 a 390), donde un`);
console.log(`     suelo NO acota: DISCRIMINA. Eso es parte del precio, no un detalle.`);

writeFileSync(
  new URL("./cobertura-fidelidad-120.json", import.meta.url),
  JSON.stringify({
    meta: { fecha: "2026-08-27", tanda: "120.ª ESCALÓN 2", rutas: RUTAS.length },
    comparadores: { n: COMPARADORES.length, excluidosUnLado: [...unLado] },
    cobertura: { union: union.size, nunca: RUTAS.length - union.size, pct: +(100 * union.size / RUTAS.length).toFixed(1) },
    porSonda: Object.fromEntries(Object.entries(porSonda).map(([k, v]) => [k, { lado: v.lado, congeladas: v.congeladas, rutas: v.n }])),
    familias: filasFam,
    ruido: { congeladas: ruido.length, rutasConCampana: rutasConCampana.size },
    rutasNuncaComparadas: RUTAS.filter((r) => !union.has(r)).slice(0, 60),
  }, null, 1),
  "utf8",
);
console.log(`\n→ derivaciones/cobertura-fidelidad-120.json`);
