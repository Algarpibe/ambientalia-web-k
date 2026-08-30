// 123.ª · PASO 0 (4) — ¿CUANTAS instancias tiene el arquetipo, de verdad?
//
// `instanciasCapturadas` de eleccion-f35-123 cuenta el DIRECTORIO del corpus
// (6 en corpus/productos), y el directorio no es el arquetipo: dentro conviven
// PRODUCTO, CATALOGO y SOFTWARE. Es §*un cardinal es un contenedor y absorbe la
// membresia* con el contenedor puesto en la carpeta.
//
// La pregunta que decide el punto 4 del encargo es: ¿tiene el arquetipo elegido
// >= 2 instancias, o sea VARIANZA INTER-INSTANCIA? Con una sola, lo que no
// separen los tests A y B sale SIN PROBAR y no se cablea.
//
// La firma se DERIVA del documento: el multiconjunto de TIPOS de modulo de Divi
// que usa. Dos instancias del mismo arquetipo comparten repertorio; dos
// arquetipos distintos, no.
//
// CONTROL: la metrica tiene que separar. Se exige que (a) todo documento sea mas
// parecido a si mismo que a cualquier otro —trivial pero caza una firma vacia—,
// y (b) que el rango de similitud no sea plano: si todos los pares dan lo mismo,
// la firma no discrimina y el reparto sale SIN DERIVAR, no inventado.

import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { join, basename } from "node:path";

function htmlsDe(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name).replace(/\\/g, "/");
    if (e.isDirectory()) htmlsDe(p, out);
    else if (/\.html$/.test(e.name)) out.push(p);
  }
  return out;
}

// tipos de modulo de Divi: et_pb_<tipo>_<ordinal>. El ordinal es de la
// instancia; el TIPO es del repertorio.
function firma(ruta) {
  const src = readFileSync(ruta, "utf8");
  // se mira el marcado, no el <style>: ahi Divi nombra sus propias clases
  // (§*el markup se busca sobre el HTML sin <style> ni <script>*)
  const limpio = src.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "");
  const tipos = new Map();
  for (const m of limpio.matchAll(/\bet_pb_([a-z_]+?)_\d+\b/g)) {
    const t = m[1];
    if (t === "section" || t === "row" || t === "column") continue; // estructura, no modulo
    tipos.set(t, (tipos.get(t) ?? 0) + 1);
  }
  return tipos;
}

function jaccard(a, b) {
  const A = new Set(a.keys()), B = new Set(b.keys());
  const inter = [...A].filter((x) => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return union ? inter / union : 0;
}

const docs = htmlsDe("corpus/productos").filter((p) => !/\/(cartuchos-inteligentes|sensor-de-calidad-del-aire)\//.test(p));
const firmas = docs.map((p) => ({ doc: basename(p, ".html"), ruta: p, f: firma(p) }));

// matriz de similitud
const matriz = firmas.map((a) => ({
  doc: a.doc,
  nTipos: a.f.size,
  vecinos: firmas
    .filter((b) => b.doc !== a.doc)
    .map((b) => ({ doc: b.doc, j: +jaccard(a.f, b.f).toFixed(3) }))
    .sort((x, y) => y.j - x.j),
}));

// ── CONTROLES ────────────────────────────────────────────────────────────────
const controles = [];
controles.push({
  nombre: "la firma no esta vacia en ningun documento",
  ok: firmas.every((x) => x.f.size > 0),
  visto: firmas.map((x) => `${x.doc.slice(0, 14)}:${x.f.size}`).join(" "),
});
const todasJ = matriz.flatMap((m) => m.vecinos.map((v) => v.j));
const rango = Math.max(...todasJ) - Math.min(...todasJ);
controles.push({
  nombre: "la similitud NO es plana (si lo fuera, la firma no discrimina)",
  ok: rango > 0.05,
  visto: `min=${Math.min(...todasJ)} max=${Math.max(...todasJ)} rango=${rango.toFixed(3)}`,
});

const salida = {
  meta: {
    tanda: "123.ª · PASO 0 (4)",
    fecha: new Date().toISOString().slice(0, 10),
    pregunta: "¿cuantas instancias CAPTURADAS tiene cada arquetipo de corpus/productos?",
    noContesta: [
      "que arquetipo es cada documento no clonado (eso lo dice un recon, no una metrica de similitud)",
      "si dos documentos parecidos comparten CONTENIDO (la firma mira el repertorio de tipos, no los valores)",
    ],
    aviso: "la similitud ORDENA vecinos; no adjudica arquetipo por si sola",
  },
  controles,
  matriz,
  firmasPorDoc: Object.fromEntries(firmas.map((x) => [x.doc, Object.fromEntries([...x.f].sort((a, b) => b[1] - a[1]))])),
};
writeFileSync("docs/research/cola-larga/derivaciones/familia-producto-123.json", JSON.stringify(salida, null, 2) + "\n", "utf8");

console.log("=== CONTROLES ===");
for (const c of controles) console.log(`  ${c.ok ? "OK " : "RED"} ${c.nombre}\n      ${c.visto}`);
console.log("");
console.log("=== VECINO MAS PARECIDO (Jaccard sobre el repertorio de tipos de modulo) ===");
for (const m of matriz) {
  console.log(`  ${m.doc.padEnd(44)} tipos=${String(m.nTipos).padStart(2)}  ${m.vecinos.map((v) => `${v.doc.slice(0, 22)}=${v.j}`).join("  ")}`);
}
const nulo = controles.some((c) => !c.ok);
console.log("");
console.log(`VEREDICTO: ${nulo ? "NULA — control en rojo" : "valida"}`);
if (nulo) process.exit(1);
