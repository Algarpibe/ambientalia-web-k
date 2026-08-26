/**
 * DERIVACIÓN · LOS 3 PARES «SIN NINGUNA REGLA CAPTURADA» SÍ LA TIENEN
 * (114.ª tanda, ESCALÓN 2 · el cierre — y NO hizo falta red)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * EL DIAGNÓSTICO DE LA 109.ª ERA EL CANAL EQUIVOCADO
 * ══════════════════════════════════════════════════════════════════════════
 *
 * `presets-efecto-109.log` cerró así:
 *
 *   > «pares SIN NINGUNA regla en lo capturado ... 3
 *   >  ⚠ Y los que no tienen ninguna regla NO son "sin efecto": son la
 *   >    COBERTURA (399 hojas sin capturar). Lo que los cerraría es capturar
 *   >    sus hojas, no medir más — y eso necesita red.»
 *
 * **No necesitaba red: el dato llevaba capturado desde el principio.**
 *
 *   | canal | páginas con alguna de las 2 clases |
 *   |---|---|
 *   | las **108 hojas `.css`** capturadas | **0** |
 *   | el **`<style>` EN LÍNEA** del HTML | **574 de 788** |
 *
 * Divi **no sirve estas reglas por la hoja enlazada: las COMPILA al documento**.
 * Es §*«la salida servida» incluye el CSS que el documento se trae* — la misma
 * lección que `qa:kb-tipografia` ya había pagado, donde diez ejes dieron cero y
 * el discriminador estaba en el `<style>` de la propia página.
 *
 * ⚠ Y por qué el «subconjunto mínimo» del ESCALÓN 2 no existía: las clases están
 * en **576 y 574 de 788 páginas**, así que «las hojas de las páginas donde viven
 * esos pares» son **399 de 399 sin capturar** — la campaña entera que el encargo
 * prohíbe. Ver `hojas-3pares-114.{mjs,json,log}`: el cardinal se publicó ANTES
 * de pedir, y por eso no se pidió nada.
 *
 * NOTA DE INSTRUMENTO: el censo se hace partiendo por `}` y no con un regex
 * anidado (`[^{}]*\{[^}]*\}`). El regex se colgó sobre los 788 ficheros por
 * backtracking — 231 KB de `<style>` por página.
 *
 * Uso:  node pares-sin-regla-114.mjs
 */

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..", "..", "..");
const CORPUS = join(RAIZ, "corpus");
const CLASES = ["et_pb_column_empty", "et_pb_section_video_on_hover"];
const RE_CLASES = new RegExp(CLASES.join("|"));

const htmls = [];
(function anda(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) { if (e.name === "css" || e.name === "_sitemaps") continue; anda(p); }
    else if (e.name.endsWith(".html")) htmls.push(p);
  }
})(CORPUS);

/* ── el censo de reglas, por los DOS canales ───────────────────────────────── */
const reglas = new Map();
let enLinea = 0, enHoja = 0;

for (const f of htmls) {
  const src = readFileSync(f, "utf8");
  const styles = (src.match(/<style[^>]*>[\s\S]*?<\/style>/gi) ?? []).join("\n");
  if (!RE_CLASES.test(styles)) continue;
  enLinea++;
  for (const b of styles.split("}")) {
    if (!RE_CLASES.test(b)) continue;
    const i = b.lastIndexOf("{");
    if (i < 0) continue;
    const sel = b.slice(0, i).trim().replace(/\s+/g, " ");
    const dec = b.slice(i + 1).trim().replace(/\s+/g, " ");
    const k = `${sel} {${dec}}`;
    reglas.set(k, (reglas.get(k) ?? 0) + 1);
  }
}

/* control: el canal que la 109.ª miró (las hojas .css) tiene que dar CERO — es
   lo que demuestra que el hallazgo es de CANAL y no de instrumento nuevo */
(function andaCss(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) andaCss(p);
    else if (e.name.endsWith(".css") && RE_CLASES.test(readFileSync(p, "utf8"))) enHoja++;
  }
})(join(CORPUS, "css"));

/* ── §regla 36 · ¿la clase es SUJETO o CONTEXTO de su selector? ────────────── */
//   SUJETO = aparece en el ÚLTIMO compuesto (tras partir por combinadores).
//   Decide DÓNDE se mide: para un contexto, comparar en el nodo que lleva la
//   clase da Δ0 CON EL DEFECTO PUESTO — el nodo no cambia, cambian sus hijos.
const papel = (sel, clase) => {
  const alt = sel.split(",").map((s) => s.trim());
  const papeles = alt.filter((a) => a.includes(clase)).map((a) => {
    const ultimo = a.split(/[\s>+~]+/).filter(Boolean).pop() ?? "";
    return ultimo.includes(clase) ? "SUJETO" : "CONTEXTO";
  });
  return [...new Set(papeles)].join("/") || "—";
};

const veredicto = [];
for (const c of CLASES) {
  const suyas = [...reglas].filter(([k]) => k.includes(c));
  const papeles = [...new Set(suyas.map(([k]) => papel(k.slice(0, k.lastIndexOf("{")), c)))];
  const hover = suyas.every(([k]) => /:hover/.test(k));
  veredicto.push({ clase: c, reglas: suyas.length, papel: papeles.join("/"), soloEnHover: hover, ejemplos: suyas.slice(0, 4).map(([k, v]) => ({ regla: k, paginas: v })) });
}

const P = (n) => String(n).padStart(4);
console.log(`\n════════ LOS 3 PARES «SIN REGLA» · 114.ª ESCALÓN 2 ════════\n`);
console.log(`  corpus    HTML recorridos ................ ${P(htmls.length)}`);
console.log(`  canal A   ficheros .css CAPTURADOS con las clases  ${P(enHoja)}   ← el que miró la 109.ª`);
console.log(`  canal B   HTML con las clases en <style> EN LÍNEA  ${P(enLinea)}   ← donde estaban`);
console.log(`  reglas DISTINTAS halladas ................ ${P(reglas.size)}`);

console.log(`\n──────── LAS REGLAS, con su denominador ────────`);
for (const [k, v] of [...reglas].sort((a, b) => b[1] - a[1]))
  console.log(`  ×${String(v).padStart(4)}  ${k.slice(0, 140)}`);

console.log(`\n──────── VEREDICTO POR CLASE (§regla 36) ────────`);
for (const v of veredicto) {
  console.log(`\n  ${v.clase}`);
  console.log(`    reglas ......... ${v.reglas}`);
  console.log(`    papel .......... ${v.papel}${v.papel.includes("CONTEXTO") ? "   ⚠ medir en los DESCENDIENTES, no en el nodo" : "   → medir EN EL NODO"}`);
  console.log(`    ¿sólo en hover? ${v.soloEnHover ? "SÍ   ⚠ su efecto NO existe sin INTERACCIÓN" : "no"}`);
}

/* ── guarda §sondas 4: ni cero ni pleno, y el control del canal ────────────── */
const fallos = [];
if (!reglas.size) fallos.push("CERO reglas: el censo no está casando nada.");
if (enHoja !== 0) fallos.push(`CONTROL DE CANAL ROTO: se esperaban 0 .css capturados con las clases y hay ${enHoja}. El hallazgo dejaría de ser «de canal».`);
if (enLinea === 0) fallos.push("CERO páginas con la clase en <style>: no hay hallazgo que congelar.");
if (enLinea === htmls.length) fallos.push("PLENO: la clase está en TODAS las páginas — un patrón que casa en todas no mide nada.");

const F = join(AQUI, "pares-sin-regla-114.json");
writeFileSync(F, JSON.stringify({
  fecha: new Date().toISOString().slice(0, 10),
  htmlRecorridos: htmls.length,
  canalHojasCss: enHoja, canalStyleEnLinea: enLinea,
  reglas: Object.fromEntries(reglas), veredicto,
}, null, 2) + "\n");
console.log(`\n  congelado en derivaciones/pares-sin-regla-114.json`);

if (fallos.length) { console.log(`\n❌ GUARDA:`); for (const f of fallos) console.log(`   ${f}`); }
console.log(`\n${fallos.length ? "❌" : "✅"} evaluadas ${enLinea} páginas con regla / ${htmls.length} HTML del corpus\n`);
process.exit(fallos.length ? 1 : 0);
