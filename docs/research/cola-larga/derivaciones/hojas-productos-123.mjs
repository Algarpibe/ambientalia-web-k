// 123.ª · ESCALON 1 (2) — LA PRECONDICION, comprobada ANTES de gastar nada.
//
// El comparador que hay que construir sigue el patron de `f33-cmp`: el lado del
// ORIGINAL es la captura renderizada por `file://` CON SUS HOJAS, con la red
// cortada. Sin las hojas la medida NO da error: da una medida PLAUSIBLE y falsa
// —esta medido en este repo, `columna.width` 678.52 contra 430.80 en vivo—.
//
// Asi que antes de escribir una linea de comparador hay que saber si las hojas
// de `corpus/productos` estan capturadas. Es §regla 37: una precondicion que no
// depende de la medicion se comprueba antes de gastarla, y esta ademas decide si
// el ESCALON 1 se puede hacer OFFLINE o necesita red.
//
// CONTROL: el resolutor tiene que encontrar hojas de ALGUN documento del repo.
// Si no encuentra ninguna en ningun sitio, su cero es del resolutor y no del
// corpus (§sondas 4). Se contrasta con `corpus/fase-3`, que f33-cmp ya usa y
// del que se sabe que SI tiene sus hojas.

import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CSS_DIR = "corpus/css";

function htmlsDe(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name).replace(/\\/g, "/");
    if (e.isDirectory()) htmlsDe(p, out);
    else if (/\.html$/.test(e.name)) out.push(p);
  }
  return out;
}

// ⚠ La v1 resolvia por BASENAME contra el raiz de corpus/css y daba 0 de 2908
// hojas en `corpus/fase-3` — el corpus que `f33-cmp` SI usa con exito. O sea que
// su cero era del RESOLUTOR, no del corpus, y lo delato el control de contraste.
// §*el veredicto lo da la salida servida*: se REPLICA la resolucion que ya
// funciona (f33-cmp L182-186) en vez de inventar otra —
//   rel = href sin el origen y sin la query;  fichero = corpus/css/<rel>
// porque las hojas se guardan CON SU RUTA de URL (wp-content/, wp-includes/).
const capturadas = [];
(function censa(dir) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) censa(p);
    else if (/\.css$/i.test(e.name)) capturadas.push(p.replace(/\\/g, "/"));
  }
})(CSS_DIR);

function relDeHoja(href) {
  const rel = href.replace(/^https?:\/\/[^/]*kunakair\.com\//i, "").split("?")[0];
  return /^https?:/i.test(rel) || rel.startsWith("/") ? null : rel; // externo
}

function hojasDe(ruta) {
  const src = readFileSync(ruta, "utf8");
  const out = [];
  for (const m of src.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    if (!/rel=["']stylesheet["']/i.test(tag)) continue;
    const href = tag.match(/href=["']([^"']+)["']/i)?.[1];
    if (!href) continue;
    const rel = relDeHoja(href);
    // «externo» y «local sin capturar» son dos cosas distintas y no pueden
    // compartir contador (f33-cmp L155-165): un CDN de terceros lo pintan roto
    // los dos lados; una hoja local sin capturar SI es un hueco.
    if (rel === null) { out.push({ href, rel: null, externo: true, capturada: false }); continue; }
    out.push({ href, rel, externo: false, capturada: existsSync(join(CSS_DIR, rel)) });
  }
  return out;
}

function informe(dir) {
  const docs = htmlsDe(dir);
  const filas = docs.map((d) => {
    const hs = hojasDe(d);
    return {
      doc: d,
      pedidas: hs.length,
      locales: hs.filter((h) => !h.externo).length,
      externas: hs.filter((h) => h.externo).length,
      capturadas: hs.filter((h) => h.capturada).length,
      faltan: hs.filter((h) => !h.capturada && !h.externo).map((h) => h.rel),
    };
  });
  const pedidas = filas.reduce((a, f) => a + f.locales, 0);
  const cap = filas.reduce((a, f) => a + f.capturadas, 0);
  const sinNinguna = filas.filter((f) => f.locales > 0 && f.capturadas === 0).length;
  const externas = filas.reduce((a, f) => a + f.externas, 0);
  return { dir, docs: docs.length, pedidas, externas, capturadas: cap, sinNinguna, filas };
}

const LOTE = informe("corpus/productos");
const CONTRASTE = informe("corpus/fase-3");

// ── CONTROLES ────────────────────────────────────────────────────────────────
const controles = [];
controles.push({
  nombre: "hay hojas capturadas en corpus/css (si no, el cero seria del resolutor)",
  ok: capturadas.length > 0,
  visto: `${capturadas.length} ficheros .css en ${CSS_DIR}`,
});
controles.push({
  nombre: "el resolutor casa en el CONTRASTE (corpus/fase-3, que f33-cmp ya usa)",
  ok: CONTRASTE.capturadas > 0,
  visto: `fase-3: ${CONTRASTE.capturadas} de ${CONTRASTE.pedidas} hojas resueltas en ${CONTRASTE.docs} docs`,
});
controles.push({
  nombre: "el detector de <link rel=stylesheet> no da cero en el lote",
  ok: LOTE.pedidas > 0,
  visto: `productos: ${LOTE.pedidas} hojas pedidas en ${LOTE.docs} docs`,
});

const salida = {
  meta: {
    tanda: "123.ª · ESCALON 1 (2)",
    fecha: new Date().toISOString().slice(0, 10),
    pregunta: "¿estan capturadas las hojas de corpus/productos? Decide si el ESCALON 1 es OFFLINE o necesita red.",
    noContesta: [
      "si las hojas capturadas son las CORRECTAS para cada documento (esto cruza por nombre de fichero, como f33-cmp)",
      "si los otros canales (imagenes, fuentes, descifradores) estan capturados",
    ],
  },
  controles,
  lote: { dir: LOTE.dir, docs: LOTE.docs, pedidas: LOTE.pedidas, capturadas: LOTE.capturadas, docsSinNingunaHoja: LOTE.sinNinguna },
  todasLasQueFaltanSonEtCache: LOTE.filas.flatMap((f) => f.faltan).every((r) => /et-cache/.test(r)),
  faltanDistintas: [...new Set(LOTE.filas.flatMap((f) => f.faltan))].sort(),
  paginasACalentar: LOTE.filas.filter((f) => f.faltan.length).map((f) => f.doc),
  contraste: { dir: CONTRASTE.dir, docs: CONTRASTE.docs, pedidas: CONTRASTE.pedidas, capturadas: CONTRASTE.capturadas, docsSinNingunaHoja: CONTRASTE.sinNinguna },
  detallePorDoc: LOTE.filas,
};
writeFileSync("docs/research/cola-larga/derivaciones/hojas-productos-123.json", JSON.stringify(salida, null, 2) + "\n", "utf8");

console.log("=== CONTROLES ===");
for (const c of controles) console.log(`  ${c.ok ? "OK " : "RED"} ${c.nombre}\n      ${c.visto}`);
console.log("");
console.log("=== HOJAS: el LOTE contra el CONTRASTE ===");
console.log(`  ${"directorio".padEnd(20)} docs  pedidas  capturadas  docs-con-0`);
for (const x of [LOTE, CONTRASTE])
  console.log(`  ${x.dir.padEnd(20)} ${String(x.docs).padStart(4)}  ${String(x.pedidas).padStart(7)}  ${String(x.capturadas).padStart(10)}  ${String(x.sinNinguna).padStart(10)}   ext=${x.externas}`);
console.log("");
console.log("=== DETALLE del lote ===");
for (const f of LOTE.filas)
  console.log(`  ${f.capturadas}/${f.locales}  ${f.doc.replace("corpus/productos/", "")}${f.faltan.length ? "   faltan: " + f.faltan.slice(0, 3).join(" ") + (f.faltan.length > 3 ? " …" : "") : ""}`);

const nulo = controles.some((c) => !c.ok);
console.log("");
console.log(`VEREDICTO DEL INSTRUMENTO: ${nulo ? "NULA — control en rojo" : "valida"}`);
console.log(
  `PRECONDICION DEL ESCALON 1: ${LOTE.capturadas === LOTE.pedidas && LOTE.pedidas > 0 ? "CUMPLE — se puede offline" : "NO CUMPLE — faltan " + (LOTE.pedidas - LOTE.capturadas) + " de " + LOTE.pedidas + " hojas, hace falta RED"}`,
);
if (nulo) process.exit(1);
