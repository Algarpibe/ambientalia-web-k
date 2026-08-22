/* v2 — v1 contaba CLASES MODIFICADORAS (gutters3, menu__wrap, with_background)
   como si fueran tipos de módulo: §sondas 4, el sobre-casado.
   v2 usa cómo Divi nombra la INSTANCIA de un módulo: et_pb_<tipo>_<n>, con
   sufijo _tb_<capa> cuando viene del theme builder. Eso separa además las dos
   CAPAS, que es el discriminador de régimen de este repo. */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const RAIZ = "C:/Users/algar/OneDrive/Documentos/Ambientalia_2026_K/kunak-web-clone";
const CORPUS = join(RAIZ, "corpus/fase-3");
const ld = JSON.parse(readFileSync(join(CORPUS, "LISTA-DERIVADA.json"), "utf8")).trabajo;

const L4 = ["/es/productos/", "/es/sectores/", "/es/recursos/", "/es/recursos/kunakpedia/",
  "/es/recursos/documentos-cientificos/", "/es/recursos/preguntas-frecuentes/"];
const grupos = {
  "hubs-KB": ld.filter((x) => x.bucket === "hubs-kb"),
  "hubs-L4": L4.map((r) => ld.find((x) => x.ruta === r)).filter(Boolean),
  "sueltas": ld.filter((x) => x.bucket === "sueltas"),
};
const limpia = (h) => h.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "");
const YA = new Set(["text", "image", "button", "blurb", "cta", "divider", "code", "gallery"]);

for (const [nombre, lista] of Object.entries(grupos)) {
  const propia = {}, tb = {};
  const porPagina = [];
  let n = 0;
  for (const e of lista) {
    const f = e.fichero ? join(CORPUS, e.fichero) : null;
    if (!f || !existsSync(f)) continue;
    n++;
    const html = limpia(readFileSync(f, "utf8"));
    const vP = new Set(), vT = new Set();
    for (const m of html.matchAll(/\bet_pb_([a-z][a-z0-9_]*?)_(\d+)(_tb_(header|body|footer))?\b/g)) {
      const tipo = m[1];
      if (m[3]) vT.add(tipo); else vP.add(tipo);
    }
    vP.forEach((t) => (propia[t] = (propia[t] || 0) + 1));
    vT.forEach((t) => (tb[t] = (tb[t] || 0) + 1));
    porPagina.push([e.ruta, [...vP].sort().join(",") || "—"]);
  }
  console.log(`\n═══ ${nombre} — ${n} HTML`);
  console.log(`  CAPA PROPIA (la del builder de la instancia — la que decide el modelo):`);
  for (const [t, c] of Object.entries(propia).sort((a, b) => b[1] - a[1]))
    console.log(`     ${YA.has(t) ? "  " : "★ "}et_pb_${t.padEnd(24)} ${String(c).padStart(3)}/${n} páginas`);
  console.log(`  CAPA _tb_ (cascarón, común): ${Object.keys(tb).sort().join(" · ") || "—"}`);
  const fuera = Object.keys(propia).filter((t) => !YA.has(t));
  console.log(`  ★ FUERA de lo que MonoSeccion[] expresa: ${fuera.length} — ${fuera.join(" · ") || "NINGUNO"}`);
  console.log(`  por página:`);
  porPagina.forEach(([r, t]) => console.log(`      ${r.padEnd(74)} ${t}`));
}
