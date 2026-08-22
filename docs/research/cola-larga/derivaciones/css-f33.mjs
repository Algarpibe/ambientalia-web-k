/* ¿Están capturadas las hojas de las páginas de F3-3? LECTURA de congeladas. */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const RAIZ = "C:/Users/algar/OneDrive/Documentos/Ambientalia_2026_K/kunak-web-clone";
const CORPUS = join(RAIZ, "corpus/fase-3");
const ld = JSON.parse(readFileSync(join(CORPUS, "LISTA-DERIVADA.json"), "utf8")).trabajo;
const idx = JSON.parse(readFileSync(join(RAIZ, "corpus/css/INDICE.json"), "utf8"));
const capt = new Set(Object.entries(idx.inventario).filter(([, v]) => v.capturada).map(([k]) => k));

const L4 = ["/es/productos/", "/es/sectores/", "/es/recursos/", "/es/recursos/kunakpedia/",
  "/es/recursos/documentos-cientificos/", "/es/recursos/preguntas-frecuentes/"];

const grupos = {
  "hubs-KB": ld.filter((x) => x.bucket === "hubs-kb"),
  "hubs-L4": L4.map((r) => ld.find((x) => x.ruta === r)).filter(Boolean),
  "sueltas": ld.filter((x) => x.bucket === "sueltas"),
};

for (const [nombre, lista] of Object.entries(grupos)) {
  let conHtml = 0, totalHojas = 0, totalCapt = 0, paginasCompletas = 0, etCacheFaltan = 0;
  const detalle = [];
  for (const e of lista) {
    const f = e.fichero ? join(CORPUS, e.fichero) : null;
    if (!f || !existsSync(f)) continue;
    conHtml++;
    const html = readFileSync(f, "utf8");
    const hojas = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi)]
      .map((m) => (m[0].match(/href=["']([^"']+)["']/) || [])[1])
      .filter(Boolean)
      .map((h) => h.split("?")[0])
      .filter((h) => /^https?:\/\/kunakair\.com\//.test(h));
    const u = [...new Set(hojas)];
    const c = u.filter((h) => capt.has(h)).length;
    totalHojas += u.length; totalCapt += c;
    if (c === u.length && u.length) paginasCompletas++;
    etCacheFaltan += u.filter((h) => /et-cache/.test(h) && !capt.has(h)).length;
    detalle.push(`    ${c}/${u.length}  ${e.ruta}`);
  }
  console.log(`\n═══ ${nombre} — ${conHtml} HTML capturados`);
  console.log(`    hojas enlazadas (distintas, sumadas): ${totalHojas} · capturadas: ${totalCapt} · FALTAN: ${totalHojas - totalCapt}`);
  console.log(`    páginas con TODAS sus hojas: ${paginasCompletas}/${conHtml}`);
  console.log(`    de las que faltan, et-cache (una por página/plantilla): ${etCacheFaltan}`);
  detalle.forEach((d) => console.log(d));
}
