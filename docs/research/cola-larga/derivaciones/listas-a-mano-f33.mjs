/**
 * BARRIDO §regla 9 caso 7 — ARRAYS DE LITERALES CUYO TRABAJO ES *RECONOCER*.
 * Uso: node docs/research/cola-larga/derivaciones/listas-a-mano-f33.mjs
 *
 * ══════════════════════════════════════════════════════════════════════════
 * QUÉ CONTESTA, Y QUÉ NO — escrito ANTES de mirar el dato (§regla del alcance)
 *
 * CONTESTA: «¿qué arrays/Sets de literales de este repo nombran cosas que OTRA
 * parte del repo PRODUCE?» — o sea, dónde puede haber una lista que envejezca
 * *contra* el repo. Los tres productores, derivados y no recordados:
 *
 *   · `COLECCIONES`      → slugs de colección   (packages/cms-config)
 *   · `scripts/qa/*.mjs` → nombres de sonda
 *   · los registros de bloques → slugs de bloque
 *
 * NO CONTESTA: si esa lista es un DEFECTO. Una lista de literales puede ser
 * perfectamente legítima —un catálogo de instancias a medir, los nombres de los
 * sabotajes de la propia sonda, una exclusión DECLARADA con su cardinal—. El
 * discriminador de la regla tiene DOS mitades y sólo la primera es mecánica:
 *
 *   (1) el productor de esos nombres puede COMBINARLOS / hacerlos crecer  ← aquí
 *   (2) y el consumidor NO FALLA cuando no casa                           ← a mano
 *
 * Así que la salida de este barrido es un CANDIDATO, y la clasificación va en
 * el acta con su razón por cada uno. Publicar el recuento mecánico como si
 * fuera el recuento de defectos sería §*un patrón que casa en TODAS tampoco
 * mide nada*.
 *
 * ⚠ El barrido EXCLUYE `scripts/qa/.tmp/` (bundles generados por esbuild: son
 * copias, no fuentes) y lo dice con su cardinal.
 * ══════════════════════════════════════════════════════════════════════════
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const RAIZ = new URL("../../../../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const AMBITOS = ["scripts", "packages"];

/* ─────────────────────── los ficheros del barrido ─────────────────────── */
const ficheros = [];
let saltadosTmp = 0;
function anda(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (e === "node_modules" || e === "dist" || e === ".next") continue;
    if (statSync(p).isDirectory()) {
      if (e === ".tmp") { saltadosTmp += readdirSync(p).filter((f) => /\.(mjs|ts)$/.test(f)).length; continue; }
      anda(p);
    } else if (/\.(mjs|ts)$/.test(e)) ficheros.push(p);
  }
}
for (const a of AMBITOS) anda(join(RAIZ, a));

/* ─────────────────── (a) los PRODUCTORES, derivados ────────────────────── */

const { COLECCIONES } = await import("../../../../packages/cms-config/src/colecciones.ts");
const SLUGS_COLECCION = new Set(COLECCIONES.map((c) => c.slug));

const QA = join(RAIZ, "scripts", "qa");
const SONDAS = new Set(
  readdirSync(QA).filter((f) => f.endsWith(".mjs") && !f.endsWith(".neg.mjs")).map((f) => f.replace(/\.mjs$/, "")),
);

const BLOQUES = new Set();
for (const f of readdirSync(join(RAIZ, "packages", "cms-config", "src", "bloques"))) {
  if (!f.endsWith(".ts")) continue;
  const txt = readFileSync(join(RAIZ, "packages", "cms-config", "src", "bloques", f), "utf8");
  for (const m of txt.matchAll(/slug:\s*"([^"]+)"/g)) BLOQUES.add(m[1]);
}

const PRODUCTORES = [
  ["colección", SLUGS_COLECCION],
  ["sonda", SONDAS],
  ["bloque", BLOQUES],
];

/* Control §sondas 4: un productor vacío no puede dar «0 candidatos». */
for (const [nombre, set] of PRODUCTORES)
  if (set.size === 0) throw new Error(`PRODUCTOR VACÍO: '${nombre}' — 0 nombres. No se puede cruzar contra la nada (§sondas 4).`);

/* ─────────── (b) los CANDIDATOS: arrays/Sets de literales puros ─────────── */

/** `new Set([...])` o `const X = [...]` cuyo interior son SÓLO cadenas. */
const RE = /(?:new Set\(\[|(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=\s*\[)([^[\]{}()]*?)\]/gs;

const candidatos = [];
let literalesVistos = 0;
for (const f of ficheros) {
  const txt = readFileSync(f, "utf8");
  const rel = relative(RAIZ, f).replace(/\\/g, "/");
  const lineaDe = (i) => txt.slice(0, i).split("\n").length;
  for (const m of txt.matchAll(RE)) {
    const cuerpo = m[2];
    if (!/"/.test(cuerpo)) continue;
    /* sólo cadenas, comas y espacios/comentarios de línea → literal puro */
    const sinCadenas = cuerpo.replace(/"(?:[^"\\]|\\.)*"/g, "").replace(/\/\/[^\n]*/g, "");
    if (/[A-Za-z0-9_$.]/.test(sinCadenas)) continue;
    const items = [...cuerpo.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1]);
    if (items.length === 0) continue;
    literalesVistos++;
    const casa = PRODUCTORES.map(([nombre, set]) => [nombre, items.filter((i) => set.has(i))])
      .filter(([, hits]) => hits.length > 0);
    if (casa.length) candidatos.push({ fichero: rel, linea: lineaDe(m.index), nombre: m[1] ?? "(new Set)", n: items.length, items, casa });
  }
}

/* ───────────────────────────── INFORME ─────────────────────────────────── */

console.log(`\n════════ BARRIDO DE LISTAS A MANO — §regla 9 caso 7 ════════\n`);
console.log(`   ficheros barridos                       ${String(ficheros.length).padStart(4)}   (scripts/ + packages/, sin node_modules)`);
console.log(`   ficheros de .tmp EXCLUIDOS              ${String(saltadosTmp).padStart(4)}   ← bundles de esbuild: copias, no fuentes`);
console.log(`   arrays/Sets de literales PUROS          ${String(literalesVistos).padStart(4)}`);
console.log(`   · que nombran algo que el repo PRODUCE  ${String(candidatos.length).padStart(4)}   ← CANDIDATOS (mitad 1 de la regla)`);
console.log(`\n   productores derivados: colección ${SLUGS_COLECCION.size} · sonda ${SONDAS.size} · bloque ${BLOQUES.size}`);

console.log(`\n  ── LOS CANDIDATOS, uno a uno (la mitad 2 —«¿falla al no casar?»— se clasifica A MANO) ──`);
for (const c of candidatos.sort((a, b) => a.fichero.localeCompare(b.fichero) || a.linea - b.linea)) {
  const que = c.casa.map(([n, h]) => `${n} ${h.length}/${c.n}`).join(" · ");
  console.log(`   ${(c.fichero + ":" + c.linea).padEnd(46)} ${c.nombre.padEnd(22)} ${que}`);
  console.log(`      ${c.items.slice(0, 12).join(", ")}${c.items.length > 12 ? ` … (+${c.items.length - 12})` : ""}`);
}

console.log(`\n  ⚠ Un candidato NO es un defecto. La regla exige las DOS mitades, y la`);
console.log(`     segunda —que el consumidor no falle cuando no casa— se lee en el código.`);
console.log(`     La clasificación con su razón por cada uno va en el acta de la tanda.\n`);
