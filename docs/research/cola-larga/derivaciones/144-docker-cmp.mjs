/**
 * 144.ª · B2 — P2: Δ0 de contenido, contenedor Docker contra referencia local.
 *
 * Compara el HTML SERVIDO por dos bases HTTP para el mismo universo de rutas
 * (el `prerender-manifest.json` local, 426 rutas), normalizando lo que el
 * generador produce distinto por construcción (§regla 32bis: BUILD_ID) antes
 * de diffear — comparar sin normalizar mediría si son el MISMO BUILD, no si
 * es el MISMO CONTENIDO.
 *
 * Uso:
 *   CONTENEDOR=http://localhost:3900 REFERENCIA=http://localhost:3901 \
 *     node docs/research/cola-larga/derivaciones/144-docker-cmp.mjs
 *
 * No es una sonda de `scripts/qa/` (no lleva el contrato `Evaluadas`): es un
 * comparador ad hoc para esta tanda, igual que `clase-spawn-shell-143.mjs`.
 */
import fs from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(import.meta.dirname, "../../../..");
const BASE_A = process.env.CONTENEDOR || "http://localhost:3900";
const BASE_B = process.env.REFERENCIA || "http://localhost:3901";

const manifiestoPath = path.join(RAIZ, "apps/web/.next/prerender-manifest.json");
const manifiesto = JSON.parse(fs.readFileSync(manifiestoPath, "utf8"));
const RUTAS = Object.keys(manifiesto.routes || {}).filter(
  (r) => !r.startsWith("/_") && !r.includes("."),
);

if (RUTAS.length === 0) {
  console.error(`❌ 0 rutas en ${manifiestoPath} — nada que comparar`);
  process.exit(2);
}

/** Los dos `BUILD_ID` que vamos a normalizar — se derivan de cada servidor en
 * caliente (payload RSC, `"b":"<id>"`), no se piden por variable de entorno:
 * así la sonda no puede citar un buildId que no sea el que de verdad sirve. */
async function buildIdDe(base) {
  const r = await fetch(base + "/", { redirect: "manual" });
  const html = await r.text();
  const m =
    /\\"b\\":\\"([A-Za-z0-9_-]{8,40})\\"/.exec(html) ||
    /"b":"([A-Za-z0-9_-]{8,40})"/.exec(html);
  return { html, buildId: m ? m[1] : null, status: r.status };
}

console.log(`Universo: ${RUTAS.length} rutas de ${path.relative(RAIZ, manifiestoPath)}`);
console.log(`A (contenedor)  = ${BASE_A}`);
console.log(`B (referencia)  = ${BASE_B}\n`);

const { buildId: buildIdA, status: statusA } = await buildIdDe(BASE_A);
const { buildId: buildIdB, status: statusB } = await buildIdDe(BASE_B);
console.log(`buildId A: ${buildIdA ?? "NO DETECTADO"} (HTTP ${statusA})`);
console.log(`buildId B: ${buildIdB ?? "NO DETECTADO"} (HTTP ${statusB})\n`);

if (!buildIdA || !buildIdB) {
  console.error("❌ no se pudo leer buildId de una de las dos bases — no se compara nada");
  process.exit(2);
}
if (buildIdA === buildIdB) {
  console.error(
    `⚠ los dos buildId son IGUALES (${buildIdA}) — A y B están sirviendo el MISMO build.` +
      ` Eso no falsea nada: revisa qué proceso está de verdad en cada puerto.`,
  );
}

function normaliza(html) {
  return html.split(buildIdA).join("<BUILDID>").split(buildIdB).join("<BUILDID>");
}

let comparadas = 0;
let distintas = 0;
const detalle = [];

for (const ruta of RUTAS) {
  const [ra, rb] = await Promise.all([
    fetch(BASE_A + ruta, { redirect: "manual" }),
    fetch(BASE_B + ruta, { redirect: "manual" }),
  ]);
  const [ha, hb] = await Promise.all([ra.text(), rb.text()]);
  comparadas++;
  const na = normaliza(ha);
  const nb = normaliza(hb);
  if (na !== nb || ra.status !== rb.status) {
    distintas++;
    detalle.push({
      ruta,
      statusA: ra.status,
      statusB: rb.status,
      lenA: ha.length,
      lenB: hb.length,
      // primer punto de divergencia, para no volcar el HTML entero
      primeraDiff: (() => {
        const n = Math.min(na.length, nb.length);
        for (let i = 0; i < n; i++) if (na[i] !== nb[i]) return i;
        return na.length === nb.length ? -1 : n;
      })(),
    });
  }
  if (comparadas % 50 === 0) console.log(`  ... ${comparadas}/${RUTAS.length}`);
}

console.log(`\n════════ P2 · Δ0 de contenido ════════`);
console.log(`comparadas: ${comparadas}/${RUTAS.length}`);
console.log(`distintas:  ${distintas}`);
if (detalle.length) {
  console.log(`\nPrimeras ${Math.min(20, detalle.length)} rutas distintas:`);
  for (const d of detalle.slice(0, 20)) {
    console.log(
      `  ${d.ruta}  status ${d.statusA}→${d.statusB}  len ${d.lenA}→${d.lenB}  primerByteDiff=${d.primeraDiff}`,
    );
  }
}

const salida = path.join(RAIZ, "docs/research/cola-larga/derivaciones/144-docker-cmp.json");
fs.writeFileSync(
  salida,
  JSON.stringify(
    { meta: { fecha: new Date().toISOString(), BASE_A, BASE_B, buildIdA, buildIdB, universo: RUTAS.length }, comparadas, distintas, detalle },
    null,
    2,
  ),
);
console.log(`\ncongelado en ${path.relative(RAIZ, salida)}`);

process.exit(distintas === 0 ? 0 : 1);
