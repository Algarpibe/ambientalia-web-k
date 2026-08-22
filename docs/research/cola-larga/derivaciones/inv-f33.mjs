/* Inventario de F3-3 — LECTURA de congeladas, no una sonda: no mide nada nuevo. */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const RAIZ = "C:/Users/algar/OneDrive/Documentos/Ambientalia_2026_K/kunak-web-clone";
const CORPUS = join(RAIZ, "corpus/fase-3");
const ld = JSON.parse(readFileSync(join(CORPUS, "LISTA-DERIVADA.json"), "utf8")).trabajo;

const L4 = [
  "/es/productos/", "/es/sectores/", "/es/recursos/",
  "/es/recursos/kunakpedia/", "/es/recursos/documentos-cientificos/",
  "/es/recursos/preguntas-frecuentes/",
];

const conjuntos = {
  "hubs-KB (7)": ld.filter((x) => x.bucket === "hubs-kb").map((x) => x),
  "hubs-L4 (6)": L4.map((r) => ld.find((x) => x.ruta === r)).filter(Boolean),
  "sueltas (35)": ld.filter((x) => x.bucket === "sueltas"),
};

/* ── hojas CSS capturadas: ¿hay un directorio de css junto al index? ── */
const CSSDIR = join(RAIZ, "corpus/css");
const cssCapturadas = existsSync(CSSDIR) ? readdirSync(CSSDIR) : [];

function estado(e) {
  const f = e.fichero ? join(CORPUS, e.fichero) : null;
  const hay = f && existsSync(f);
  const bytes = hay ? statSync(f).size : 0;
  return { ruta: e.ruta, bucket: e.bucket, familia: e.familia, fuentes: (e.fuentes || []).join("+"), capturada: hay, bytes };
}

for (const [nombre, lista] of Object.entries(conjuntos)) {
  console.log(`\n═══ ${nombre} — n=${lista.length}`);
  let cap = 0;
  for (const e of lista) {
    const s = estado(e);
    if (s.capturada) cap++;
    console.log(`  ${s.capturada ? "✔" : "✘"} ${s.ruta.padEnd(72)} ${String(s.bytes).padStart(7)}  [${s.fuentes}]`);
  }
  console.log(`  → capturadas ${cap}/${lista.length}`);
}

console.log(`\n═══ corpus/css: ${cssCapturadas.length} entradas`);
console.log("  " + cssCapturadas.slice(0, 20).join("\n  "));
