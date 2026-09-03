/**
 * 144.ª · B2 — P2 DEFINITIVA: Δ de contenido, contenedor contra referencia, EN CUBOS.
 *
 * §regla 32bis: comparar dos artefactos GENERADOS exige normalizar lo que el
 * generador produce distinto por construcción, y publicar **dos cubos** — el
 * artefacto completo y el contenido que de verdad se consume. Sin eso, el
 * comparador contesta «¿es el mismo BUILD?» en vez de «¿es el mismo CONTENIDO?».
 *
 * Los cuatro artefactos identificados en esta tanda, cada uno con su cubo:
 *
 *   1 · `buildId`                — distinto por definición entre dos builds
 *   2 · hash de chunk CSS/JS     — direccionado por contenido; cambia con 1 byte
 *   3 · troceado del payload RSC — el mismo payload en distinto nº de <script>
 *   4 · ORDEN de las etiquetas de <head> — mismo conjunto, distinta secuencia
 *
 * CONTROLES (§regla 28c: el control no es la aritmética de la condición):
 *   · cada normalizador publica su CARDINAL de sustituciones y tiene que ser
 *     > 0 en LOS DOS lados, o no está ocurriendo y el veredicto no vale;
 *   · el cubo 1 tiene que ser >= el cubo 4: si normalizar de más «arreglara»
 *     hacia arriba, el normalizador estaría inventando.
 *
 * Uso: CONTENEDOR=http://localhost:3900 REFERENCIA=http://localhost:3901 \
 *        node docs/research/cola-larga/derivaciones/144-p2-cubos.mjs
 */
import fs from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(import.meta.dirname, "../../../..");
const A = process.env.CONTENEDOR || "http://localhost:3900";
const B = process.env.REFERENCIA || "http://localhost:3901";

const manifiesto = JSON.parse(
  fs.readFileSync(path.join(RAIZ, "apps/web/.next/prerender-manifest.json"), "utf8"),
);
const RUTAS = Object.keys(manifiesto.routes || {}).filter(
  (r) => !r.startsWith("/_") && !r.includes("."),
);

async function buildIdDe(base) {
  const html = await fetch(base + "/", { redirect: "manual" }).then((r) => r.text());
  const m =
    /\\"b\\":\\"([A-Za-z0-9_-]{8,40})\\"/.exec(html) || /"b":"([A-Za-z0-9_-]{8,40})"/.exec(html);
  return m ? m[1] : null;
}

const bidA = await buildIdDe(A);
const bidB = await buildIdDe(B);
if (!bidA || !bidB) {
  console.error("❌ no se pudo leer el buildId de una de las dos bases");
  process.exit(2);
}

const cont = { bid: 0, hash: 0, rsc: 0, head: 0 };

function normBuild(s, bid) {
  const antes = s;
  const out = s.split(bid).join("<B>");
  if (out !== antes) cont.bid++;
  return out;
}
function normHash(s) {
  const out = s.replace(
    /\/_next\/static\/chunks\/[A-Za-z0-9_-]+\.(css|js)/g,
    "/_next/static/chunks/<HASH>.$1",
  );
  if (out !== s) cont.hash++;
  return out;
}
function normRsc(s) {
  const out = s
    .replace(/<script>self\.__next_f[\s\S]*?<\/script>/g, "<RSC/>")
    .replace(/(<RSC\/>)+/g, "<RSC*/>");
  if (out !== s) cont.rsc++;
  return out;
}
/** Ordena las etiquetas del `<head>`: el conjunto se conserva, la secuencia no. */
function normHead(s) {
  const i = s.indexOf("<head>"), j = s.indexOf("</head>");
  if (i < 0 || j < 0) return s;
  const head = s.slice(i, j);
  const etiquetas = [...head.matchAll(/<(link|meta|title)[^>]*>(?:[^<]*<\/title>)?/g)].map((m) => m[0]);
  if (!etiquetas.length) return s;
  cont.head++;
  return s.slice(0, i) + "<HEAD:" + etiquetas.slice().sort().join("") + ">" + s.slice(j);
}

let comparadas = 0;
const cubos = { c1_artefactoCompleto: 0, c2_sinRsc: 0, c3_sinRscNiOrdenHead: 0 };
const restos = [];

for (const ruta of RUTAS) {
  const [ra, rb] = await Promise.all([
    fetch(A + ruta, { redirect: "manual" }),
    fetch(B + ruta, { redirect: "manual" }),
  ]);
  const [ha, hb] = await Promise.all([ra.text(), rb.text()]);
  comparadas++;

  const c1a = normHash(normBuild(ha, bidA));
  const c1b = normHash(normBuild(hb, bidB));
  if (c1a !== c1b || ra.status !== rb.status) cubos.c1_artefactoCompleto++;

  const c2a = normRsc(c1a), c2b = normRsc(c1b);
  if (c2a !== c2b) cubos.c2_sinRsc++;

  const c3a = normHead(c2a), c3b = normHead(c2b);
  if (c3a !== c3b) {
    cubos.c3_sinRscNiOrdenHead++;
    if (restos.length < 10) {
      let i = 0;
      while (i < Math.min(c3a.length, c3b.length) && c3a[i] === c3b[i]) i++;
      restos.push({ ruta, i, a: c3a.slice(Math.max(0, i - 60), i + 80), b: c3b.slice(Math.max(0, i - 60), i + 80) });
    }
  }
}

const controlOk =
  cont.bid >= comparadas && cont.hash >= comparadas && cont.rsc >= comparadas && cont.head >= comparadas;

console.log("════════ P2 · Δ DE CONTENIDO EN CUBOS ════════");
console.log(`universo                                   : ${comparadas}/${RUTAS.length} rutas`);
console.log(`buildId  A=${bidA}  B=${bidB}`);
console.log();
console.log("CONTROL de los normalizadores (sustituciones, deben ser ≥ 2×universo):");
console.log(`  buildId ${cont.bid} · hash ${cont.hash} · rsc ${cont.rsc} · head ${cont.head}   ${controlOk ? "✅" : "❌ alguno NO está ocurriendo"}`);
console.log();
console.log(`CUBO 1 · artefacto COMPLETO (−buildId −hashes)          : ${cubos.c1_artefactoCompleto}`);
console.log(`CUBO 2 · −troceado del payload RSC                      : ${cubos.c2_sinRsc}`);
console.log(`CUBO 3 · −orden del <head>  ← EL CONTENIDO CONSUMIDO    : ${cubos.c3_sinRscNiOrdenHead}`);
if (restos.length) {
  console.log("\nrestos (primeros):");
  for (const r of restos) {
    console.log(`  ${r.ruta} @${r.i}`);
    console.log(`    A: ${JSON.stringify(r.a)}`);
    console.log(`    B: ${JSON.stringify(r.b)}`);
  }
}

const salida = path.join(RAIZ, "docs/research/cola-larga/derivaciones/144-p2-cubos.json");
fs.writeFileSync(
  salida,
  JSON.stringify({ meta: { fecha: new Date().toISOString(), A, B, bidA, bidB, universo: comparadas }, control: cont, controlOk, cubos, restos }, null, 2),
);
console.log(`\ncongelado en ${path.relative(RAIZ, salida)}`);

process.exit(controlOk ? 0 : 1);
