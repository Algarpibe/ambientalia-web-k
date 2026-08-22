/* redirects-f33 — 92.ª tanda, 2026-08-22. ESCALÓN 1, punto 2.
 *
 * CMS-3 dice que quién emite los 13 redirects «es trabajo de F3-3 y no de esta
 * colección». Esto DERIVA el reparto para que ese trabajo se pueda presupuestar
 * sin volver a abrir el original:
 *
 *   · qué mecanismo del repo puede emitirlos HOY  → derivado del código;
 *   · a dónde apunta cada uno                     → de la congelada de las 16;
 *   · cuáles caen en una ruta que el build YA EMITE → del prerender-manifest;
 *   · cuáles caen DENTRO de la propia cola larga  → de LISTA-DERIVADA;
 *   · cuáles apuntan a una IMAGEN                 → de la extensión del destino.
 *
 * ⚠ NO implementa nada. La 92.ª tiene escrito «no los implementes».
 *
 * ⚠ ALCANCE (§*escribe qué preguntas NO contesta*): el prerender-manifest es una
 * FOTO del último build; su fecha se imprime. No dice si la página servida en esa
 * ruta es correcta, sólo que la ruta se emite (§*una ruta que responde 200 no
 * prueba que sirva CONTENIDO*).
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { statSync } from "node:fs";

const RAIZ = "C:/Users/algar/OneDrive/Documentos/Ambientalia_2026_K/kunak-web-clone";
const DERIV = join(RAIZ, "docs/research/cola-larga/derivaciones");
const CORPUS = join(RAIZ, "corpus/fase-3");
const PM = join(RAIZ, "apps/web/.next/prerender-manifest.json");

/* ── 1 · ¿QUÉ MECANISMO EXISTE HOY? — derivado del código, no recordado ────── */
console.log("═══ 1 · MECANISMOS DE REDIRECCIÓN EN EL REPO, derivados");
const canales = [
  { nombre: "next.config redirects()", buscar: /async\s+redirects\s*\(|redirects\s*:/ , en: ["apps/web/next.config.ts"] },
  { nombre: "middleware.ts",            buscar: /./,  en: ["apps/web/middleware.ts", "apps/web/src/middleware.ts", "middleware.ts"] },
  { nombre: "redirect() de next/navigation", buscar: /\bredirect\s*\(/, en: null },   // barrido
  { nombre: "permanentRedirect()",      buscar: /\bpermanentRedirect\s*\(/, en: null },
];
const barre = (dir, out = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".next") || e.name === ".git") continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) barre(p, out);
    else if (/\.(ts|tsx|js|mjs)$/.test(e.name)) out.push(p);
  }
  return out;
};
const fuentes = [
  ...(existsSync(join(RAIZ, "apps/web/src")) ? barre(join(RAIZ, "apps/web/src")) : []),
  ...(existsSync(join(RAIZ, "src")) ? barre(join(RAIZ, "src")) : []),
];
let vivos = 0;
for (const c of canales) {
  let hits = [];
  if (c.en) {
    for (const f of c.en) if (existsSync(join(RAIZ, f)) && c.buscar.test(readFileSync(join(RAIZ, f), "utf8"))) hits.push(f);
  } else {
    for (const f of fuentes) if (c.buscar.test(readFileSync(f, "utf8"))) hits.push(f.replace(RAIZ + "/", ""));
  }
  vivos += hits.length ? 1 : 0;
  console.log(`  ${hits.length ? "✅" : "❌"} ${c.nombre.padEnd(32)} ${hits.length ? hits.join(" · ") : "NO EXISTE"}`);
}
console.log(`  ▸ canales de redirección VIVOS en el repo: ${vivos} de ${canales.length}`);
console.log(`     (barrido sobre ${fuentes.length} ficheros de fuente)`);
/* CONTROL §sondas 4: si el barrido no encontró NI UN fichero, el 0 es del
 * instrumento, no del repo. */
if (fuentes.length === 0) throw new Error("BARRIDO VACÍO: 0 ficheros de fuente — el 0 sería del instrumento");

/* ── 2 · las 13, con su destino ────────────────────────────────────────────── */
const rev = JSON.parse(readFileSync(join(DERIV, "sueltas-16-reverificadas-2026-08-22.json"), "utf8"));
const r301 = rev.rutas.filter((r) => r.http === 301);
const r404 = rev.rutas.filter((r) => r.http === 404);

/* rutas que el BUILD emite hoy */
if (!existsSync(PM)) throw new Error(`prerender-manifest AUSENTE: ${PM}`);
const pm = JSON.parse(readFileSync(PM, "utf8"));
const EMITIDAS = new Set(Object.keys(pm.routes || {}));
const fechaPM = statSync(PM).mtime.toISOString().slice(0, 16).replace("T", " ");

/* el conjunto de la cola larga (las 48 rutas) */
const ld = JSON.parse(readFileSync(join(CORPUS, "LISTA-DERIVADA.json"), "utf8")).trabajo;
const L4 = ["/es/productos/", "/es/sectores/", "/es/recursos/", "/es/recursos/kunakpedia/",
  "/es/recursos/documentos-cientificos/", "/es/recursos/preguntas-frecuentes/"];
const COLA = new Set([
  ...ld.filter((x) => x.bucket === "hubs-kb").map((x) => x.ruta),
  ...L4,
  ...ld.filter((x) => x.bucket === "sueltas").map((x) => x.ruta),
]);
/* todo el corpus de trabajo: para saber si el destino está en OTRA familia */
const TODO = new Set(ld.map((x) => x.ruta));

const norm = (r) => r.replace(/\/+$/, "") || "/";
/* el clon no lleva prefijo /es/ ni barra final (trailingSlash desactivado) */
const aLocal = (r) => norm(r.replace(/^\/es/, "")) || "/";

const IMG = /\.(png|jpe?g|gif|webp|svg|avif|pdf)$/i;

console.log(`\n═══ 2 · LOS 13 REDIRECTS, con su destino y su estado`);
console.log(`  build de referencia: ${EMITIDAS.size} rutas emitidas · prerender-manifest de ${fechaPM}`);

const cubos = { emitida: [], enCola: [], enOtraFamilia: [], otroPrefijo: [], imagen: [], externa: [], sinDestino: [] };
const filas = [];
/* índice por ÚLTIMO SEGMENTO, para separar «no existe» de «existe con otro prefijo» */
const PORCOLA = new Map();
for (const r of EMITIDAS) {
  const seg = r.split("/").filter(Boolean).pop();
  if (seg) (PORCOLA.get(seg) || PORCOLA.set(seg, []).get(seg)).push(r);
}
for (const r of r301.sort((a, b) => a.ruta.localeCompare(b.ruta))) {
  const loc = r.location || "";
  const path = loc.replace(/^https?:\/\/[^/]+/, "");
  const seg = path.split("/").filter(Boolean).pop();
  let cubo, alt = null;
  if (!loc) cubo = "sinDestino";
  else if (IMG.test(path)) cubo = "imagen";
  else if (!/^https?:\/\/kunakair\.com/i.test(loc)) cubo = "externa";
  else if (EMITIDAS.has(aLocal(path))) cubo = "emitida";
  else if (COLA.has(norm(path) + "/")) cubo = "enCola";
  else if (TODO.has(norm(path) + "/")) cubo = "enOtraFamilia";
  else if (PORCOLA.has(seg)) { cubo = "otroPrefijo"; alt = PORCOLA.get(seg); }
  else cubo = "sinDestino";
  cubos[cubo].push(r.ruta);
  filas.push({ origen: r.ruta, destino: path || "—", local: IMG.test(path) ? "—" : aLocal(path), cubo, alt });
}

const ETIQ = {
  emitida: "el build YA EMITE el destino, tal cual",
  enCola: "el destino está DENTRO de la cola larga (lo emitirá F3-3)",
  enOtraFamilia: "el destino está en OTRA familia del corpus de trabajo",
  otroPrefijo: "⚠ el destino NO se emite con ese prefijo, pero SÍ con otro — cadena de 301 o decisión de prefijo, INDECIDIBLE con un solo salto",
  imagen: "el destino es una IMAGEN, no una página",
  externa: "el destino está fuera de kunakair.com",
  sinDestino: "sin destino resoluble a ninguna ruta del clon",
};
for (const f of filas) {
  console.log(`  ${f.cubo.padEnd(14)} ${f.origen.padEnd(80)}`);
  console.log(`  ${"".padEnd(14)}   → ${f.destino}${f.local !== "—" ? `   [local ${f.local}]` : ""}`);
  if (f.alt) console.log(`  ${"".padEnd(14)}   ⚠ el build sí emite: ${f.alt.join(" · ")}`);
}

console.log(`\n═══ 3 · EL REPARTO — por lo que hace falta para emitir cada uno`);
let tot = 0;
for (const [k, v] of Object.entries(cubos)) {
  tot += v.length;
  console.log(`  ${String(v.length).padStart(2)}  ${k.padEnd(14)} ${ETIQ[k]}`);
}
console.log(`  ──`);
console.log(`  ${String(tot).padStart(2)}  TOTAL 301   (+ ${r404.length} bajas 404, que NO son redirects)`);
/* CONTROL: el reparto tiene que sumar exactamente los 301 de la congelada. */
if (tot !== r301.length) throw new Error(`REPARTO DESCUADRADO: ${tot} ≠ ${r301.length}`);

console.log(`\n  ▸ las ${r404.length} BAJAS (404) — no tienen destino, así que no son redirección:`);
for (const r of r404.sort((a, b) => a.ruta.localeCompare(b.ruta))) console.log(`      ${r.ruta}`);

console.log(`\n═══ 4 · LO QUE ESTO **NO** CONTESTA`);
console.log(`  · no dice CÓMO emitirlos: no hay canal en el repo, así que hay que estrenar uno`);
console.log(`  · no dice si la página del destino es CORRECTA — sólo que la ruta se emite`);
console.log(`  · no dice qué hacer con las ${r404.length} bajas: 404 propio, 410, o no emitir nada`);
console.log(`  · el prerender-manifest es una FOTO (${fechaPM}); un build nuevo puede mover el reparto`);
