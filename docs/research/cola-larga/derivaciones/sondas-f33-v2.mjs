/* v2 — v1 SOBRE-CASABA: aceptaba la forma sin `/es/`, que en los extractores es
   la clave de un RECUENTO DE ENLACES ENTRANTES ("/contacto": 4), no una medida.
   Verificado a mano contra c-extraido.json y extractor-corpus.json.
   v2 exige la forma `/es/…` — la que usan los medidores para nombrar el original —
   y publica el CONTEXTO de cada acierto para que se pueda auditar. */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const RAIZ = "C:/Users/algar/OneDrive/Documentos/Ambientalia_2026_K/kunak-web-clone";
const MED = join(RAIZ, "scripts/qa/medidas");
const ld = JSON.parse(readFileSync(join(RAIZ, "corpus/fase-3/LISTA-DERIVADA.json"), "utf8")).trabajo;

const L4 = ["/es/productos/", "/es/sectores/", "/es/recursos/", "/es/recursos/kunakpedia/",
  "/es/recursos/documentos-cientificos/", "/es/recursos/preguntas-frecuentes/"];
const grupos = {
  "hubs-KB": ld.filter((x) => x.bucket === "hubs-kb").map((x) => x.ruta),
  "hubs-L4": L4,
  "sueltas": ld.filter((x) => x.bucket === "sueltas").map((x) => x.ruta),
};

const ficheros = readdirSync(MED).filter((f) => f.endsWith(".json"));
const esArtefacto = (f) => /-neg-|SABOTAJE|SONDA-|CONTAMINADA|CADUCADA|OBSOLETA|-neg\.json/.test(f);
const cache = new Map();
const texto = (f) => {
  if (!cache.has(f)) { try { cache.set(f, readFileSync(join(MED, f), "utf8")); } catch { cache.set(f, ""); } }
  return cache.get(f);
};
const sondaDe = (f) => f.replace(/\.json$/, "").replace(/-(1440|390)(?=-|$)/, "")
  .replace(/-\d{4}-\d{2}-\d{2}.*$/, "").replace(/-(antes|despues|p0|p1|base|vivo|todas)$/, "");

/* GUARDA §sondas 4: el patrón que casa en TODAS no mide nada. Un control en
   negativo con una ruta que NO existe tiene que dar 0. */
const CONTROL = '"/es/esta-ruta-no-existe-jamas/"';
let controlHits = 0;

for (const [nombre, rutas] of Object.entries(grupos)) {
  console.log(`\n═══ ${nombre} — n=${rutas.length}`);
  let tocadas = 0;
  const todas = new Set();
  for (const r of rutas) {
    const vs = ['"' + r + '"', '"' + r.replace(/\/$/, "") + '"'];
    const hits = new Set();
    let ctx = "";
    for (const f of ficheros) {
      if (esArtefacto(f)) continue;
      const t = texto(f);
      for (const v of vs) {
        const i = t.indexOf(v);
        if (i >= 0) {
          hits.add(sondaDe(f));
          if (!ctx) ctx = t.slice(Math.max(0, i - 90), i + v.length + 60).replace(/\s+/g, " ");
          break;
        }
      }
    }
    if (hits.size) tocadas++;
    hits.forEach((h) => todas.add(h));
    console.log(`  ${hits.size ? "✔" : "✘"} ${r.padEnd(74)} ${hits.size ? [...hits].sort().join(", ") : "— NINGUNA"}`);
    if (ctx) console.log(`        ctx: …${ctx}…`);
  }
  console.log(`  → MEDIDAS (forma /es/, congelada no-artefacto): ${tocadas}/${rutas.length}`);
  console.log(`  → sondas: ${[...todas].sort().join(" · ") || "ninguna"}`);
}

for (const f of ficheros) if (!esArtefacto(f) && texto(f).includes(CONTROL)) controlHits++;
console.log(`\n▸ CONTROL en negativo (ruta inventada): ${controlHits} ficheros — debe ser 0. ${controlHits === 0 ? "✅" : "❌ el patrón sobre-casa"}`);
