// 124.ª · EL MECANISMO DE `FN-bp` — que un valor DEL EDITOR se mueva con el ancho.
//
// `paso0-nodos-124` clasifica 20 fallos del test A como «el editor escribio un px
// POR PUNTO DE RUPTURA». Eso era una HIPOTESIS: la cascada se lee a 1440, asi que
// lo medido es «a 1440 gana una declaracion del editor en px» y «a 390 el
// computado es otro» — el `@media` estaba INFERIDO.
//
// Inferir el mecanismo y medirlo son dos cosas (§*el veredicto lo da la salida
// servida*), y aqui medirlo cuesta un recorrido del HTML capturado. Se hace.
//
// LO QUE SE BUSCA: una regla dentro de un `@media` cuyo selector lleve ORDINAL
// (`et_pb_<tipo>_<n>`, la huella del editor) y que declare uno de los 4 ejes de
// ritmo. Si existe, el editor SI escribe valores que dependen del ancho — y la
// premisa del test A («lo que el editor toca queda en px absolutos, IGUALES a
// 1440 y a 390») es falsa por construccion en ese caso.

import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CORPUS = join(process.cwd(), "corpus/productos");
const DOCS = [
  { doc: "monitor-calidad-aire.html", arquetipo: "PRODUCTO" },
  { doc: "accesorios.html", arquetipo: "CATALOGO" },
  { doc: "software-de-medicion-calidad-del-aire.html", arquetipo: "SOFTWARE" },
  { doc: "kunak-api.html", arquetipo: "SOFTWARE-corta" },
];
const faltan = DOCS.filter((d) => !existsSync(join(CORPUS, d.doc)));
if (faltan.length) { console.error(`❌ PRECONDICION: faltan ${faltan.map((d) => d.doc).join(", ")}`); process.exit(1); }

const EJES = ["margin-top", "margin-bottom", "padding-top", "padding-bottom"];
const ORDINAL = /^et_pb_[a-z_]+_\d+(_[a-z]+)*$/;
const esOrdinal = (sel) => {
  if (/_tb_/.test(sel)) return false;
  for (const m of sel.matchAll(/\.([A-Za-z_][\w-]*)/g)) if (ORDINAL.test(m[1])) return true;
  return false;
};

const porDoc = {};
for (const d of DOCS) {
  const h = readFileSync(join(CORPUS, d.doc), "utf8");
  const conOrdinal = [];
  const sinOrdinal = [];
  const breakpoints = new Set();
  for (const m of h.matchAll(/@media[^{]*\{/g)) {
    let i = m.index + m[0].length, depth = 1;
    while (i < h.length && depth > 0) { if (h[i] === "{") depth++; else if (h[i] === "}") depth--; i++; }
    const blk = h.slice(m.index, i);
    const cab = blk.slice(0, blk.indexOf("{")).trim();
    /* reglas de primer nivel dentro del bloque */
    for (const r of blk.slice(blk.indexOf("{") + 1).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const sel = r[1].trim(), cuerpo = r[2];
      const ejes = EJES.filter((e) => new RegExp(`(^|[;\\s])${e}\\s*:`).test(cuerpo));
      if (!ejes.length) continue;
      (esOrdinal(sel) ? conOrdinal : sinOrdinal).push({ cab, sel: sel.slice(0, 160), ejes, cuerpo: cuerpo.trim().slice(0, 120) });
      if (esOrdinal(sel)) breakpoints.add(cab);
    }
  }
  porDoc[d.arquetipo] = { conOrdinal: conOrdinal.length, sinOrdinal: sinOrdinal.length, breakpoints: [...breakpoints], muestra: conOrdinal.slice(0, 3) };
}

const totalOrdinal = Object.values(porDoc).reduce((a, v) => a + v.conOrdinal, 0);
const totalGenerico = Object.values(porDoc).reduce((a, v) => a + v.sinOrdinal, 0);

const controles = [];
controles.push({ nombre: "se recorrio algo (hay reglas de ritmo dentro de @media)", ok: totalOrdinal + totalGenerico > 0, visto: `con ordinal ${totalOrdinal} · genericas ${totalGenerico}` });
/* ⚠ EL CONTROL QUE IMPIDE EL PLENO: si TODAS las reglas de @media salieran «con
 * ordinal», el discriminador no estaria discriminando — estaria casando con todo
 * (§*un patron que casa en TODAS tampoco mide nada*). */
controles.push({ nombre: "`esOrdinal` DISCRIMINA dentro de @media (no casa con todas)", ok: totalOrdinal > 0 && totalGenerico > 0, visto: `con ordinal ${totalOrdinal} · genericas ${totalGenerico}` });
const nulo = controles.some((c) => !c.ok);

const salida = {
  meta: {
    tanda: "124.ª · PASO 0 — mecanismo de FN-bp", fecha: new Date().toISOString().slice(0, 10),
    lado: "UNO — el HTML capturado del original. No mide geometria: recorre el CSS servido",
    pregunta: "¿el EDITOR escribe valores de ritmo que dependen del ancho?",
    porQue: "si los escribe, la premisa del test A —«lo que el editor toca queda en px absolutos, IGUALES a 1440 y a 390»— es falsa, y su falso negativo en RITMO tiene mecanismo",
    noContesta: ["cuantos NODOS toca cada regla: eso lo mide paso0-nodos-124 con la cascada"],
  },
  controles,
  reglasDeRitmoDentroDeMedia: { conOrdinalDelEditor: totalOrdinal, conSelectorGenerico: totalGenerico },
  porDoc,
  veredicto: nulo ? "NULA — control en rojo" : "valida",
};
writeFileSync("docs/research/cola-larga/derivaciones/fn-bp-mecanismo-124.json", JSON.stringify(salida, null, 2) + "\n", "utf8");

console.log("=== CONTROLES ===");
for (const c of controles) console.log(`  ${c.ok ? "OK " : "RED"} ${c.nombre}\n      ${c.visto}`);
console.log("");
console.log("=== REGLAS DE RITMO DENTRO DE @media, POR QUIEN LAS ESCRIBIO ===");
console.log(`  con ORDINAL (el editor):   ${totalOrdinal}`);
console.log(`  con selector generico:     ${totalGenerico}`);
console.log("");
for (const [a, v] of Object.entries(porDoc)) {
  console.log(`  ${a.padEnd(15)} editor=${String(v.conOrdinal).padStart(4)} generico=${String(v.sinOrdinal).padStart(4)}  breakpoints=[${v.breakpoints.join(" · ")}]`);
  for (const m of v.muestra) console.log(`      ${m.cab}\n        ${m.sel} { ${m.cuerpo} }`);
}
console.log("");
console.log(totalOrdinal > 0
  ? `⇒ MEDIDO: el editor SI escribe ritmo por punto de ruptura (${totalOrdinal} reglas). La premisa del test A\n  —«lo que el editor toca queda en px absolutos, IGUALES a 1440 y a 390»— es FALSA en esos casos.`
  : `⇒ NO se hallo ni una: FN-bp se queda SIN MECANISMO MEDIDO.`);
console.log("");
console.log(`VEREDICTO: ${salida.veredicto}`);
process.exit(nulo ? 1 : 0);
