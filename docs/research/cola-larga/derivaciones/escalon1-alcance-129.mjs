// 129.ª · ESCALÓN 1 — EL ALCANCE DEL CAMBIO, DERIVADO DEL ÁRBOL DE IMPORTS.
//
// §regla 8b, segunda mitad: cuando lo que predices es el efecto de un cambio,
// «qué toca el cambio» se DERIVA —del `diff` y del grafo de imports—, nunca se
// recuerda. Una lista escrita de memoria produce una predicción INCOMPLETA que
// se lee como cumplida, porque lo que sí predijiste acierta y lo que olvidaste
// no sale nombrado en ninguna parte.
//
// Y §regla 3, tercera hermana: **ningún comentario declara quién usa un
// componente**. Un `grep` sobre las `page.tsx` sólo ve los imports DIRECTOS, y
// aquí el componente compartido lo importan otros COMPONENTES — así que la
// lista directa se queda corta y la predicción saldría sobre menos rutas de
// las que el cambio mueve.
//
// LO QUE CONTESTA: qué rutas alcanzan, TRANSITIVAMENTE, los ficheros que esta
// tanda ha tocado — o sea el conjunto sobre el que hay que exigir NO-OP.
// LO QUE NO CONTESTA: no mide un píxel. OFFLINE.

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { execSync } from "node:child_process";

const RAIZ = process.cwd();
const SRC = join(RAIZ, "apps", "web", "src");
const OUT = join(RAIZ, "docs", "research", "cola-larga", "derivaciones");

const salida = [];
const di = (s = "") => {
  salida.push(s);
  console.log(s);
};
const fallos = [];
const control = (id, ok, det) => {
  di(`   ${ok ? "✓" : "✗"} ${id} · ${det}`);
  if (!ok) fallos.push(id);
};

/* ── los ficheros TOCADOS salen del `diff`, no de una lista ─────────────── */
const tocados = execSync("git diff --name-only", { cwd: RAIZ, encoding: "utf8" })
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.startsWith("apps/web/src/") && /\.tsx?$/.test(s));

/* ── el grafo de imports ────────────────────────────────────────────────── */
function ficheros(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) ficheros(p, acc);
    else if (/\.tsx?$/.test(e.name)) acc.push(p);
  }
  return acc;
}
const todos = ficheros(SRC);
const rel = (p) => p.replace(RAIZ + "\\", "").replace(RAIZ + "/", "").replace(/\\/g, "/");

/* `X importa Y`. Sólo imports de VALOR: un `import type` no arrastra render, y
 * contarlo inflaría el alcance con ficheros que el cambio no puede mover. */
const importa = new Map();
for (const f of todos) {
  const src = readFileSync(f, "utf8");
  const objetivos = new Set();
  for (const m of src.matchAll(/import\s+(type\s+)?([\s\S]*?)\s*from\s*["']([^"']+)["']/g)) {
    if (m[1]) continue; // `import type ... from`
    if (/^\s*\{\s*type\s/.test(m[2]) && !/,/.test(m[2])) continue;
    const spec = m[3];
    let cand = null;
    if (spec.startsWith("@/")) cand = join(SRC, spec.slice(2));
    else if (spec.startsWith(".")) cand = resolve(dirname(f), spec);
    if (!cand) continue;
    for (const ext of [".tsx", ".ts", "/index.tsx", "/index.ts"]) {
      if (existsSync(cand + ext)) {
        objetivos.add(cand + ext);
        break;
      }
    }
  }
  importa.set(f, objetivos);
}

/* ── de una `page.tsx`, qué ficheros alcanza (cierre transitivo) ────────── */
const pages = todos.filter((f) => /[\\/]app[\\/].*page\.tsx$/.test(f));
const alcanceDe = (page) => {
  const vistos = new Set();
  const pila = [page];
  while (pila.length) {
    const x = pila.pop();
    for (const y of importa.get(x) ?? []) if (!vistos.has(y)) (vistos.add(y), pila.push(y));
  }
  return vistos;
};

const rutaDe = (p) =>
  "/" + rel(p).replace(/^apps\/web\/src\/app\//, "").replace(/\/page\.tsx$/, "").replace(/^\(.*?\)\//, "");

di("═".repeat(78));
di("129.ª · ESCALÓN 1 — el ALCANCE del cambio, derivado del grafo de imports");
di("═".repeat(78));
di("");
di(`   ficheros TOCADOS (del \`git diff\`, no de memoria): ${tocados.length}`);
for (const t of tocados) di(`     · ${t}`);
di("");

const tocadosAbs = tocados.map((t) => join(RAIZ, t.replace(/\//g, "\\")));
const afectadas = [];
for (const p of pages) {
  const al = alcanceDe(p);
  const hit = tocadosAbs.filter((t) => al.has(t) || p === t);
  if (hit.length) afectadas.push({ ruta: rutaDe(p), page: rel(p), por: hit.map(rel) });
}

di(`   RUTAS AFECTADAS (transitivo): ${afectadas.length} de ${pages.length} pages`);
di("   | ruta | por qué fichero |");
di("   |---|---|");
for (const a of afectadas) di(`   | \`${a.ruta}\` | ${a.por.map((x) => x.split("/").pop()).join(", ")} |`);
di("");

/* La comparación directo-vs-transitivo es el hallazgo, no un adorno: si el
 * directo se queda corto, una predicción escrita sobre él saldría «cumplida»
 * dejando fuera las rutas que faltan. */
/* ⚠ Y ESTE DETECTOR LLEGÓ SOBRE-CASADO, en la misma tanda que cita la regla
 * que lo prohíbe: buscaba el NOMBRE del componente como substring del fuente y
 * casaba dentro de un COMENTARIO — `/accesorios` dice *«que ya llevan HeroApi y
 * HeroSoftware»* en una nota de QA y **no lo importa**. Salía como «directa» y
 * el control L4 se ponía rojo con razón (§regla 9, el falso positivo del
 * comentario; §regla 21: la primera orden ante un rojo es comprobar si es
 * legítimo, no ajustar el control).
 *
 * Se descuentan comentarios y se exige la forma de un IMPORT, no la mención. */
const directas = [];
for (const p of pages) {
  const codigo = readFileSync(p, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, " ")
    .split("\n")
    .map((l) => l.replace(/(^|[^:])\/\/.*$/, "$1"))
    .join("\n");
  const importados = [...codigo.matchAll(/import\s+(?!type\s)([\s\S]*?)\s*from\s*["'][^"']+["']/g)].map((m) => m[1]).join(" ");
  if (tocados.some((t) => new RegExp(`\\b${t.split("/").pop().replace(/\.tsx?$/, "")}\\b`).test(importados))) directas.push(rutaDe(p));
}
di(`   por import DIRECTO en la page: ${directas.length} — ${directas.join(", ")}`);
di(`   por TRANSITIVO:                ${afectadas.length} — ${afectadas.map((a) => a.ruta).join(", ")}`);
di("");

const LOTE = ["/monitor-calidad-aire", "/accesorios", "/software-de-medicion-calidad-del-aire", "/kunak-api"];
const delLote = afectadas.filter((a) => LOTE.includes(a.ruta)).map((a) => a.ruta);
const fueraDelLote = afectadas.filter((a) => !LOTE.includes(a.ruta)).map((a) => a.ruta);
di(`   del LOTE F3-5 ....... ${delLote.length} de 4 — ${delLote.join(", ") || "ninguna"}`);
di(`   FUERA del lote ...... ${fueraDelLote.length} — ${fueraDelLote.join(", ") || "ninguna"}`);
di("");

di("── controles ───────────────────────────────────────────────────────────");
control("L1 · hay cambios que analizar", tocados.length > 0, `${tocados.length} ficheros en el diff`);
control("L2 · el grafo no está muerto", pages.length > 0 && [...importa.values()].some((s) => s.size > 0), `${pages.length} pages · ${todos.length} ficheros indexados`);
control("L3 · el transitivo NO es un pleno", afectadas.length < pages.length, `${afectadas.length} de ${pages.length} pages — si fueran todas, estaría midiendo el cascarón`);
control("L4 · el transitivo ⊇ el directo", directas.every((d) => afectadas.some((a) => a.ruta === d)), `directo ${directas.length} ⊆ transitivo ${afectadas.length}`);
di("");

di("═".repeat(78));
di("PREDICCIÓN QUE ESTE ALCANCE HABILITA");
di("");
di(`  · NO-OP exigible en las ${afectadas.length} rutas afectadas, a 1440 Y a 390.`);
di(`  · Y en las ${pages.length - afectadas.length} NO afectadas el cambio no puede llegar: si alguna se mueve, el defecto no es el marcador.`);
di("");
di(`  controles: ${fallos.length === 0 ? "todos en verde" : `EN ROJO — ${fallos.join(", ")}`}`);
di("═".repeat(78));

const nombre = process.env.NEG ? `escalon1-alcance-129-neg-${process.env.NEG}` : "escalon1-alcance-129";
writeFileSync(
  join(OUT, `${nombre}.json`),
  JSON.stringify(
    { meta: { tanda: "129.ª", fecha: new Date().toISOString().slice(0, 10), offline: true, criterio: "cierre transitivo de imports de VALOR desde cada page.tsx; `import type` descontado" }, tocados, afectadas, directas, delLote, fueraDelLote, nPages: pages.length, controles: { fallos, verde: fallos.length === 0 } },
    null,
    2,
  ) + "\n",
);
writeFileSync(join(OUT, `${nombre}.log`), salida.join("\n") + "\n");
process.exit(fallos.length ? 3 : 0);
