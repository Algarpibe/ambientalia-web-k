/* arbol-f33 — 92.ª tanda, 2026-08-22. ESCALÓN 2, paso previo.
 *
 * Antes de escribir la colección hay que DERIVAR su forma. Escribir un esquema
 * cuya estructura no se ha medido es inventarla, y este repo tiene catalogado
 * lo que sale de ahí (§*una propiedad que no pasa ningún test está SIN PROBAR,
 * y SIN PROBAR no se cablea*).
 *
 * Esto recorre las 32 capturas y saca, de la CAPA PROPIA:
 *   · el anidamiento real (sección → fila → columna → módulo) y su profundidad;
 *   · los repartos de columna que existen;
 *   · por cada uno de los 12 tipos, QUÉ CONTENIDO lleva cada instancia — que es
 *     lo que dice qué campos necesita su bloque.
 *
 * ── El parser, y por qué no es un regex plano ──────────────────────────────
 * Divi anida `div`s y un regex no cuenta profundidad. Se tokeniza `<div`/`</div`
 * llevando una pila, que es lo mínimo para que «los módulos de ESTA columna» no
 * incluya los de la columna de al lado.
 *
 * CONTROLES (§sondas 4 · §sondas 8):
 *   · si el tokenizador no encuentra NI UNA sección propia en NINGUNA página, es
 *     un defecto del parser, no un cero del original;
 *   · el nº de módulos por tipo tiene que CUADRAR con `mod-v4.log`, que los contó
 *     con otro instrumento (regex sobre el HTML entero). Dos instrumentos, misma
 *     cuenta — y si discrepan, se dice cuál y cuánto (§sondas 4: *cruzar con otra
 *     medida del mismo objeto es obligatorio antes de creerse un recuento*).
 *
 * ⚠ NO abre el original. NO congela en `medidas/`. NO decide modelo: describe.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const RAIZ = "C:/Users/algar/OneDrive/Documentos/Ambientalia_2026_K/kunak-web-clone";
const CORPUS = join(RAIZ, "corpus/fase-3");

/* ── el tokenizador con pila ───────────────────────────────────────────────── */
const VACIOS = new Set(["img", "br", "hr", "input", "meta", "link", "source", "area", "col", "embed", "param", "track", "wbr"]);

/** Devuelve el árbol de elementos con `clases`, `etiqueta`, `hijos` y `html` interno. */
export function parsea(html) {
  const raiz = { etiqueta: "#raiz", clases: [], hijos: [], ini: 0, fin: html.length };
  const pila = [raiz];
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*?)(\/?)>/g;
  let m;
  while ((m = re.exec(html))) {
    const [todo, cierre, etiq, attrs, auto] = m;
    const tag = etiq.toLowerCase();
    if (cierre) {
      for (let i = pila.length - 1; i > 0; i--) {
        if (pila[i].etiqueta === tag) {
          pila[i].fin = m.index;
          pila.length = i;
          break;
        }
      }
      continue;
    }
    if (auto || VACIOS.has(tag)) continue;
    const cm = /\bclass="([^"]*)"/.exec(attrs);
    const nodo = {
      etiqueta: tag,
      clases: cm ? cm[1].split(/\s+/).filter(Boolean) : [],
      attrs,
      hijos: [],
      ini: m.index + todo.length,
      fin: html.length,
    };
    pila[pila.length - 1].hijos.push(nodo);
    pila.push(nodo);
  }
  return raiz;
}

export const recorre = function* (n) {
  for (const h of n.hijos) { yield h; yield* recorre(h); }
};
export const limpia = (h) => h.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "");
/** `et_pb_<tipo>_<n>` de la capa propia (los `_tb_` son cascarón). */
export const tipoDe = (n) => {
  for (const c of n.clases) {
    const m = /^et_pb_([a-z][a-z0-9_]*?)_(\d+)$/.exec(c);
    if (m && !c.includes("_tb_")) return m[1];
  }
  return null;
};
export const esPropia = (n) => !n.clases.some((c) => c.includes("_tb_"));
/**
 * ⚠ **Predicado, no conjunto — y también lo enseñó el control.** Con un `Set`
 * de literales, `et_pb_column_4_4` se lee como `tipo = "column_4"`, que **no
 * está en el conjunto**, así que la columna pasaba por módulo; y como
 * `modulosDe` no desciende dentro de un módulo, el recorrido paraba en la
 * columna y devolvía **0 de todo**. Es §regla 9 caso 7 —una lista de literales
 * dentro de la derivación— con la variante de que el productor de esos nombres
 * los COMBINA (`column` + reparto), así que la lista estaba incompleta desde el
 * día que se escribió.
 */
export const esEstructura = (t) => /^(section|row|row_inner|column(_\d+)?|column_inner(_\d+)?)$/.test(t);

/** Las secciones de la CAPA PROPIA: `et_pb_section` sin sufijo `_tb_`. */
export function seccionesPropias(raiz) {
  const out = [];
  for (const n of recorre(raiz)) {
    if (!n.clases.includes("et_pb_section")) continue;
    if (n.clases.some((c) => /^et_pb_section_\d+_tb_/.test(c))) continue;
    out.push(n);
  }
  return out;
}

/**
 * Los MÓDULOS directamente dentro de un nodo, sin bajar a otro módulo.
 *
 * ⚠ **NO se exige `et_pb_module`, y lo enseñó el CONTROL CRUZADO.** La primera
 * versión lo exigía y daba **`button` 0 páginas** contra las **6** de `mod-v4`:
 * el módulo botón de Divi es **`<a class="et_pb_button et_pb_button_0 …">`**, un
 * ancla **sin** `et_pb_module`. Un selector que no casa con nada no es un cero
 * (§sondas 4), y aquí no habría dado error: habría dado «este arquetipo no usa
 * botones», que es un dato plausible y falso.
 *
 * El criterio pasa a ser el ordinal propio —`et_pb_<tipo>_<n>` sin `_tb_`— que
 * es lo que Divi escribe SIEMPRE. Y no se desciende dentro de un módulo ya
 * encontrado, que es lo que mantiene `et_pb_slide` **dentro** de su slider.
 */
export function modulosDe(nodo) {
  const out = [];
  const baja = (n) => {
    for (const h of n.hijos) {
      const t = tipoDe(h);
      if (t && !esEstructura(t)) { out.push(h); continue; }
      baja(h);
    }
  };
  baja(nodo);
  return out;
}

/* ══════════════════════════════════════════════════════════════════════════
 * ⚠ EL INFORME SÓLO CORRE SI ESTE FICHERO ES EL PUNTO DE ENTRADA.
 *
 * `prueba-union-f33.mjs` importa el parser de aquí, y sin esta guarda el
 * `import` **ejecuta el informe entero** y lo mete en el log de la prueba. No
 * es un fallo de medición —los dos informes son correctos— pero sí de canal:
 * un log con dos informes pegados invita a citar el número del de arriba
 * creyendo que es del de abajo, que es §regla 1 cobrada sobre el lector.
 * ═════════════════════════════════════════════════════════════════════════ */
if (process.argv[1] && import.meta.url !== pathToFileURL(process.argv[1]).href) {
  /* importado como librería: nada de informe */
} else {
  informe();
}

function informe() {
/* ── el recorrido ─────────────────────────────────────────────────────────── */
const ld = JSON.parse(readFileSync(join(CORPUS, "LISTA-DERIVADA.json"), "utf8")).trabajo;
const L4 = ["/es/productos/", "/es/sectores/", "/es/recursos/", "/es/recursos/kunakpedia/",
  "/es/recursos/documentos-cientificos/", "/es/recursos/preguntas-frecuentes/"];
const grupos = {
  "hubs-KB": ld.filter((x) => x.bucket === "hubs-kb"),
  "hubs-L4": L4.map((r) => ld.find((x) => x.ruta === r)).filter(Boolean),
  "sueltas": ld.filter((x) => x.bucket === "sueltas"),
};

const porTipo = {};           // tipo -> [{ruta, clases, htmlCorto, ...}]
const repartos = {};          // "1_2+1_2" -> n
const profundidad = {};       // "seccion>fila>columna" etc.
let nPag = 0, nSec = 0, nFila = 0, nCol = 0, nMod = 0;
const porPagina = [];

for (const [grupo, lista] of Object.entries(grupos)) {
  for (const e of lista) {
    const f = e.fichero ? join(CORPUS, e.fichero) : null;
    if (!f || !existsSync(f)) continue;
    nPag++;
    const html = limpia(readFileSync(f, "utf8"));
    const raiz = parsea(html);
    const secs = seccionesPropias(raiz);
    let sMod = 0, sFila = 0;
    const tiposPag = new Set();
    for (const sec of secs) {
      nSec++;
      const filas = [...recorre(sec)].filter((n) => n.clases.includes("et_pb_row") && esPropia(n) && !n.clases.includes("et_pb_row_inner"));
      /* fullwidth: módulos colgados de la sección sin fila */
      const sueltosDeSeccion = modulosDe(sec).filter((m) => !filas.some((fi) => m.ini > fi.ini && m.fin <= fi.fin));
      if (sueltosDeSeccion.length) profundidad["seccion>modulo (sin fila)"] = (profundidad["seccion>modulo (sin fila)"] || 0) + sueltosDeSeccion.length;
      for (const fi of filas) {
        nFila++; sFila++;
        const cols = [...recorre(fi)].filter((n) => n.clases.includes("et_pb_column") && esPropia(n));
        const anchos = cols.map((c) => (c.clases.find((x) => /^et_pb_column_\d+_\d+$/.test(x)) || "").replace("et_pb_column_", "")).filter(Boolean);
        if (anchos.length) repartos[anchos.join("+")] = (repartos[anchos.join("+")] || 0) + 1;
        for (const c of cols) nCol++;
        profundidad["seccion>fila>columna>modulo"] = (profundidad["seccion>fila>columna>modulo"] || 0) + 1;
      }
      for (const m of modulosDe(sec)) {
        const t = tipoDe(m);
        if (!t || esEstructura(t)) continue;
        nMod++; sMod++;
        tiposPag.add(t);
        (porTipo[t] = porTipo[t] || []).push({
          ruta: e.ruta, grupo,
          clases: m.clases.filter((c) => !/^et_pb_[a-z_]+_\d+$/.test(c)),
          interno: html.slice(m.ini, m.fin),
        });
      }
    }
    porPagina.push({ ruta: e.ruta, grupo, secciones: secs.length, filas: sFila, modulos: sMod, tipos: [...tiposPag].sort() });
  }
}

/* CONTROL §sondas 4: un parser que no encuentra nada NO es un cero del original. */
if (nSec === 0) throw new Error("PARSER MUERTO: 0 secciones propias en las 32 páginas");
if (nMod === 0) throw new Error("PARSER MUERTO: 0 módulos de contenido");

console.log("═══ 1 · EL ÁRBOL DE LA CAPA PROPIA, derivado de las 32 capturas");
console.log(`  páginas ${nPag} · secciones ${nSec} · filas ${nFila} · columnas ${nCol} · módulos ${nMod}`);
console.log(`  formas de anidamiento vistas:`);
for (const [k, v] of Object.entries(profundidad).sort((a, b) => b[1] - a[1])) console.log(`     ${String(v).padStart(4)}  ${k}`);

console.log(`\n═══ 2 · LOS REPARTOS DE COLUMNA — ¿vale la regla de la retícula de KB?`);
for (const [k, v] of Object.entries(repartos).sort((a, b) => b[1] - a[1])) {
  const suma = k.split("+").reduce((s, x) => { const [a, b] = x.split("_").map(Number); return s + a / b; }, 0);
  console.log(`     ${String(v).padStart(3)}  ${k.padEnd(26)} suma ${suma.toFixed(4)} ${Math.abs(suma - 1) < 1e-6 ? "✅" : "⚠ NO SUMA 1"}`);
}

console.log(`\n═══ 3 · POR PÁGINA — secciones · filas · módulos · tipos`);
for (const p of porPagina) {
  console.log(`  ${p.grupo.padEnd(9)} ${p.ruta.padEnd(72)} S${String(p.secciones).padStart(2)} F${String(p.filas).padStart(2)} M${String(p.modulos).padStart(3)}  ${p.tipos.join(",")}`);
}

console.log(`\n═══ 4 · CADA TIPO, CON SU n Y SU CONTENIDO`);
const tieneImg = (s) => /<img[^>]/i.test(s);
const tieneA = (s) => /<a\s[^>]*href=/i.test(s);
const hN = (s) => [...s.matchAll(/<(h[1-6])\b/gi)].map((m) => m[1].toLowerCase());
const texto = (s) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
for (const [t, insts] of Object.entries(porTipo).sort((a, b) => b[1].length - a[1].length)) {
  const pags = new Set(insts.map((i) => i.ruta));
  console.log(`\n  ── et_pb_${t}  ·  ${insts.length} instancias en ${pags.size} páginas`);
  const rasgos = {
    "con <img>": insts.filter((i) => tieneImg(i.interno)).length,
    "con <a href>": insts.filter((i) => tieneA(i.interno)).length,
    "con encabezado": insts.filter((i) => hN(i.interno).length).length,
    "con texto": insts.filter((i) => texto(i.interno).length > 0).length,
    "con <iframe>": insts.filter((i) => /<iframe/i.test(i.interno)).length,
  };
  console.log(`     rasgos: ${Object.entries(rasgos).map(([k, v]) => `${k} ${v}/${insts.length}`).join(" · ")}`);
  const cls = {};
  insts.forEach((i) => i.clases.forEach((c) => { if (c !== "et_pb_module" && !c.startsWith("et_pb_" + t)) cls[c] = (cls[c] || 0) + 1; }));
  const disc = Object.entries(cls).filter(([, v]) => v < insts.length).sort((a, b) => b[1] - a[1]);
  console.log(`     clases que NO están en todas (candidatas a campo): ${disc.length ? disc.map(([c, v]) => `${c} ${v}/${insts.length}`).join(" · ") : "NINGUNA"}`);
  console.log(`     páginas: ${[...pags].join(" · ")}`);
  if (insts.length <= 2) {
    insts.forEach((i, k) => {
      const t2 = texto(i.interno);
      console.log(`     [${k + 1}] ${i.ruta}`);
      console.log(`         texto (200): ${t2.slice(0, 200)}${t2.length > 200 ? "…" : ""}`);
    });
  }
}

/* ── CONTROL CRUZADO con mod-v4.log, que contó con OTRO instrumento ────────── */
console.log(`\n═══ 5 · CONTROL CRUZADO contra mod-v4.log (otro instrumento, mismo objeto)`);
const v4 = readFileSync(join(RAIZ, "docs/research/cola-larga/derivaciones/mod-v4.log"), "utf8");
const bloqueUnion = v4.slice(v4.indexOf("LA UNIÓN QUE C3 NECESITA"));
const esperado = {};
for (const m of bloqueUnion.matchAll(/et_pb_([a-z_]+)\s+(\d+) págs/g)) esperado[m[1]] = Number(m[2]);
/**
 * ⚠ Una discrepancia ESPERADA y EXPLICADA se declara con su razón; las demás
 * cierran el código de salida. Sin la declaración, la explicación sería una
 * excusa escrita después de ver el número (§regla 8b).
 */
const EXPLICADAS = {
  slide: "mod-v4 barre el documento con un regex plano, así que cuenta `et_pb_slide` " +
    "como tipo de primer nivel. El ÁRBOL dice que vive DENTRO de su slider " +
    "(`et_pb_fullwidth_slider_0 > et_pb_slides > et_pb_slide_0`), o sea que NO es un " +
    "bloque de la unión: es el array interno del slider. Contesta P-S1 y P-S2 offline.",
};
let disc = 0, expl = 0;
for (const t of [...new Set([...Object.keys(esperado), ...Object.keys(porTipo)])].sort()) {
  const mio = porTipo[t] ? new Set(porTipo[t].map((i) => i.ruta)).size : 0;
  const suyo = esperado[t] ?? 0;
  if (mio === suyo) continue;
  if (EXPLICADAS[t]) {
    expl++;
    console.log(`     ℹ et_pb_${t.padEnd(18)} árbol ${mio} · mod-v4 ${suyo} — EXPLICADA:`);
    console.log(`        ${EXPLICADAS[t]}`);
  } else {
    disc++;
    console.log(`     ⚠ et_pb_${t.padEnd(18)} árbol ${mio} págs · mod-v4 ${suyo} págs — SIN EXPLICAR`);
  }
}
const nT = new Set([...Object.keys(esperado), ...Object.keys(porTipo)]).size;
console.log(`     tipos comparados: ${nT} · discrepancias SIN EXPLICAR: ${disc} · explicadas: ${expl}`);
if (disc === 0) console.log(`     ✅ los dos instrumentos cuentan lo mismo salvo las ${expl} declaradas`);
else { console.error(`\n❌ ${disc} discrepancias sin explicar entre dos instrumentos del mismo objeto.`); process.exit(2); }

}
