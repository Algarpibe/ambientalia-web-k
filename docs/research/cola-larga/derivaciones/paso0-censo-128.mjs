// 128.ª · PASO 0 — EL CENSO DEL CORPUS Y LA PREGUNTA QUE PUEDE CAMBIAR LA TANDA.
//
// El encargo afirma que de las 4 rutas de F3-5 sólo PRODUCTO tiene familia, y
// que CATÁLOGO · SOFTWARE · SOFTWARE-corta están a n = 1. §regla 9 no hace
// excepción con las premisas del encargo: se DERIVAN.
//
// LO QUE CONTESTA, y sólo esto:
//
//   1 · el censo del corpus por RÉGIMEN (los DOS marcadores del `<body>`, y la
//       combinación vacía es un dato — §el cuarto casillero). 788 documentos.
//   2 · ¿son los 17 `cartuchos-inteligentes` + 1 `sensor-de-calidad-del-aire`
//       instancias del arquetipo CATÁLOGO? Si lo son, `accesorios` SÍ tiene
//       familia y la premisa de la tanda es FALSA para una de las tres.
//   3 · LA DIRECCIÓN CONTRARIA (§*una comprobación retroactiva se enmarca en
//       las DOS direcciones*): ¿tiene alguno de los 3 «singleton» hermanas en
//       OTRO sitio del corpus que un censo por `<body>` no vea? El barrido es
//       sobre los 788, no sobre `corpus/productos`.
//
// CÓMO SE CONTESTA, y por qué no por el directorio ni por el CPT: los 17
// cartuchos y `accesorios` sirven EL MISMO `<body class>` —mismo CPT
// `single-solutions`, misma plantilla `solutions-template-default`, mismo
// régimen `B-`— así que ni el directorio ni el CPT ni el régimen discriminan
// aquí. Lo que cruza instancias es el MARCADOR SEMÁNTICO (§regla 29).
//
// LAS DOS FIRMAS, CADA UNA CON SU CRITERIO CONGELADO (§regla 31 hermana: dos
// instrumentos que censan el mismo objeto tienen que compartir el criterio, y
// se unifica CON EL YA CONGELADO porque es el que tiene consumidores):
//
//   A · TIPOS DE MÓDULO — el predicado EXACTO de `familia-producto-123.mjs`,
//       que SÍ quita `<style>` y `<script>`. Está aquí como CONTROL DE
//       REPRODUCCIÓN: si sus 6×5 Jaccard no reproducen, el instrumento cambió
//       de significado y nada de lo de abajo vale.
//   B · MARCADORES SEMÁNTICOS — el predicado EXACTO de `paso0-dominio-127.mjs`,
//       que NO los quita. Es la llave con la que la sonda de varianza empareja
//       de verdad, así que EL VEREDICTO SE DA SOBRE B.
//
//   ⚠ Y como los dos criterios difieren justo en eso, se publica además B con
//     `<style>`/`<script>` fuera — declarada como MEDIDA SECUNDARIA — para
//     decir si B hereda el mismo defecto o es inmune. No se sustituye: se mide.
//
// ⚠ EL UMBRAL DE JACCARD NO ES INVARIANTE DE ESCALA, y esto decide cómo se lee
// un cero: con |A| = 4, alcanzar J ≥ 0.7 exige un hermano de a lo sumo 5
// marcadores con 4 compartidos; con |A| = 19 el margen es enorme. Así que «0
// hermanas» puede ser del UMBRAL y no del objeto. Por eso se publica, al lado
// de cada Jaccard: (a) el CARDINAL ALCANZABLE —el mayor |B| que aún podría
// llegar al umbral—, y (b) el SOLAPE (|A∩B|/min), que sí es escalable, y (c)
// los ELEMENTOS nombrados, porque una pregunta de membresía se contesta
// nombrando, no contando (§*un cardinal es un contenedor*).
//
// LO QUE NO CONTESTA: no mide varianza ni cascada. Eso es el ESCALÓN 3.
//
// ALCANCE: 788 documentos del corpus. OFFLINE: no toca red, ni clon, ni
// Postgres, ni construye.

import { readFileSync, existsSync, writeFileSync, readdirSync } from "node:fs";
import { join, relative, basename } from "node:path";

const RAIZ = process.cwd();
const CORPUS = join(RAIZ, "corpus");
const PRODUCTOS = join(CORPUS, "productos");
const DERIV = join(RAIZ, "docs/research/cola-larga/derivaciones");
const FAM123_LOG = join(DERIV, "familia-producto-123.log");

/* ── PRECONDICIONES ANTES DE GASTAR NADA (§regla 37) ────────────────────── */
const faltan = [];
for (const p of [CORPUS, PRODUCTOS, FAM123_LOG]) if (!existsSync(p)) faltan.push(relative(RAIZ, p));
if (faltan.length) {
  console.error(`❌ PRECONDICION: faltan ${faltan.join(", ")}`);
  process.exit(1);
}

const controles = [];
const ctl = (ok, nombre, detalle) => controles.push({ ok, nombre, detalle });

/* ── LA FECHA SE DERIVA DEL SISTEMA, NO SE ESCRIBE A MANO ───────────────── */
const HOY = new Date().toISOString().slice(0, 10);

/* ═══ 0 · RECORRIDO DEL CORPUS ══════════════════════════════════════════ */
function todosLosHtml(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) todosLosHtml(p, acc);
    else if (e.name.endsWith(".html")) acc.push(p);
  }
  return acc;
}
const DOCS = todosLosHtml(CORPUS).sort();
const rel = (p) => relative(CORPUS, p).replace(/\\/g, "/");
ctl(DOCS.length > 0, "el corpus tiene documentos que recorrer", `${DOCS.length} ficheros .html`);

/* ═══ 1 · EL RÉGIMEN — los DOS marcadores, y la combinación vacía es dato ══ */
const bodyDe = (html) => {
  const m = html.match(/<body[^>]*\bclass\s*=\s*["']([^"']*)["']/i);
  return m ? m[1] : "";
};
function regimenDe(clasesBody) {
  const cs = new Set(clasesBody.split(/\s+/).filter(Boolean));
  const B = cs.has("et_pb_pagebuilder_layout");
  const T = cs.has("et-tb-has-body");
  return `${B ? "B" : "-"}${T ? "T" : "-"}`;
}
/* El invariante del marcador `-T` (§*una clase se puede copiar a mano*): el
   constructor numera cada sección UNA vez ⇒ N secciones, N ordinales DISTINTOS.
   Con `occ == 1` es DEGENERADO —0 separadoras por construcción—, no positivo. */
function invarianteTb(html) {
  const occ = [...html.matchAll(/et_pb_section_(\d+)_tb_body/g)].map((m) => m[1]);
  if (occ.length === 0) return { occ: 0, dis: 0, veredicto: "sin secciones _tb_body" };
  const dis = new Set(occ).size;
  if (occ.length === 1) return { occ: 1, dis: 1, veredicto: "INDETERMINADO (degenerado)" };
  return { occ: occ.length, dis, veredicto: occ.length === dis ? "numeradas ⇒ constructor" : "REPITE ⇒ a mano" };
}

/* ═══ 2 · LAS DOS FIRMAS, CADA UNA CON SU CRITERIO CONGELADO ════════════ */

/* A · el predicado EXACTO de `familia-producto-123.mjs` §firma(). */
function tiposDe(src) {
  const limpio = src.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "");
  const tipos = new Set();
  for (const m of limpio.matchAll(/\bet_pb_([a-z_]+?)_\d+\b/g)) {
    const t = m[1];
    if (t === "section" || t === "row" || t === "column") continue;
    tipos.add(t);
  }
  return tipos;
}

/* B · el predicado EXACTO de `paso0-dominio-127.mjs` §marcadoresDe(). */
const esSemantica = (c) => !/^et[_-]/.test(c) && !/^(wp|has|is|clearfix)/.test(c) && c.length > 2;
function semanticosDe(html, limpiar = false) {
  const src = limpiar
    ? html.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "")
    : html;
  const cuerpo = src.slice(src.indexOf("<body"));
  const out = new Set();
  for (const m of cuerpo.matchAll(/class\s*=\s*["']([^"']*)["']/gi)) {
    const clases = m[1].split(/\s+/).filter(Boolean);
    if (!clases.some((c) => /^et_pb_(section|row|module)$/.test(c))) continue;
    if (clases.some((c) => /_tb_(header|footer)/.test(c))) continue;
    for (const c of clases) if (esSemantica(c)) out.add(c);
  }
  return out;
}

const jaccard = (a, b) => {
  const inter = [...a].filter((x) => b.has(x)).length;
  const uni = new Set([...a, ...b]).size;
  return uni === 0 ? 0 : Number((inter / uni).toFixed(4));
};
const solape = (a, b) => {
  const inter = [...a].filter((x) => b.has(x)).length;
  const m = Math.min(a.size, b.size);
  return m === 0 ? 0 : Number((inter / m).toFixed(4));
};
/* El mayor |B| que aún puede alcanzar el umbral con esta |A|, en el mejor caso
   (A ⊆ B): J = |A|/|B| >= U  ⇒  |B| <= |A|/U. */
const cardinalAlcanzable = (nA, U) => Math.floor(nA / U);

/* ── UNA SOLA PASADA POR EL CORPUS ── */
const fichaDoc = new Map();
const firmaA = new Map();
const firmaB = new Map();
const firmaBlimpia = new Map();
const porRegimen = new Map();
const porDir = new Map();

for (const p of DOCS) {
  const r = rel(p);
  const html = readFileSync(p, "utf8");
  const clases = bodyDe(html);
  const reg = regimenDe(clases);
  const dir1 = r.split("/")[0];
  fichaDoc.set(r, {
    rel: r, dir1, regimen: reg,
    cpt: (clases.match(/\bsingle-([a-z0-9_-]+)\b/) || [])[1] ?? null,
    plantilla: (clases.match(/\b([a-z0-9_-]+-template(?:-default)?)\b/) || [])[1] ?? null,
    invarianteTb: reg.includes("T") ? invarianteTb(html) : null,
  });
  firmaA.set(r, tiposDe(html));
  firmaB.set(r, semanticosDe(html, false));
  firmaBlimpia.set(r, semanticosDe(html, true));
  porRegimen.set(reg, (porRegimen.get(reg) ?? 0) + 1);
  if (!porDir.has(dir1)) porDir.set(dir1, new Map());
  const m = porDir.get(dir1);
  m.set(reg, (m.get(reg) ?? 0) + 1);
}

ctl(porRegimen.size >= 2,
  "el censo de régimen DISCRIMINA (un solo casillero sería el detector — §sondas 4, el pleno)",
  [...porRegimen].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(" · "));

/* ═══ 3 · CONTROL DE REPRODUCCIÓN CONTRA LA 123.ª ═══════════════════════ */
/* Los valores de ayer se DERIVAN del log congelado, no se cablean (§regla 5ter:
   un control que cablea el valor de ayer caduca solo). Y la 123.ª excluye los
   subdirectorios `cartuchos-inteligentes` y `sensor-de-calidad-del-aire`. */
const DOCS_123 = DOCS.map(rel)
  .filter((r) => r.startsWith("productos/") && !/^productos\/(cartuchos-inteligentes|sensor-de-calidad-del-aire)\//.test(r));
const nombre123 = new Map(DOCS_123.map((r) => [basename(r, ".html"), r]));

const ayer = new Map();
for (const linea of readFileSync(FAM123_LOG, "utf8").split(/\r?\n/)) {
  const t = linea.trim();
  const m = t.match(/^([a-z0-9-]+)\s+tipos=\s*(\d+)\s+(.*)$/);
  if (!m) continue;
  ayer.set(m[1], {
    tipos: Number(m[2]),
    pares: [...m[3].matchAll(/([a-z0-9-]+)=([\d.]+)/g)].map((x) => [x[1], Number(x[2])]),
  });
}
ctl(ayer.size > 0, "el log de la 123.ª se puede PARSEAR (si diera 0 filas, el regex no casa — §sondas 4)", `${ayer.size} filas leídas`);

/* La 123.ª TRUNCA los nombres a 22 caracteres en la lista de vecinos. Se
   resuelve por prefijo contra los nombres de HOY, exigiendo unicidad. */
const resuelve = (corto) => {
  const cand = [...nombre123.keys()].filter((k) => k.startsWith(corto));
  return cand.length === 1 ? nombre123.get(cand[0]) : null;
};

const reproA = [];
for (const [doc, dat] of ayer) {
  const ruta = nombre123.get(doc);
  if (!ruta) { reproA.push({ doc, estado: "SIN RESOLVER en el corpus de hoy" }); continue; }
  const yo = firmaA.get(ruta);
  const pares = dat.pares.map(([corto, val]) => {
    const otro = resuelve(corto);
    if (!otro) return { otro: corto, estado: "SIN RESOLVER" };
    const hoy = Number(jaccard(yo, firmaA.get(otro)).toFixed(3));
    return { otro: basename(otro, ".html"), ayer: val, hoy, casa: Math.abs(hoy - val) < 0.0011 };
  });
  reproA.push({ doc, tiposAyer: dat.tipos, tiposHoy: yo.size, tiposOk: yo.size === dat.tipos, pares });
}
const todosPares = reproA.flatMap((r) => r.pares ?? []);
const nCasan = todosPares.filter((p) => p.casa).length;
const nTiposOk = reproA.filter((r) => r.tiposOk).length;
ctl(nCasan === todosPares.length && todosPares.length > 0 && nTiposOk === reproA.length,
  "CONTROL DE REPRODUCCIÓN · la firma A reproduce Jaccard y cardinales de la 123.ª",
  `pares ${nCasan}/${todosPares.length} · cardinales ${nTiposOk}/${reproA.length}`);

/* ═══ 4 · LA PREGUNTA · ¿tienen familia los 3 «singleton»? ══════════════ */
const ANCLAS = {
  PRODUCTO: "productos/monitor-calidad-aire.html",
  CATALOGO: "productos/accesorios.html",
  SOFTWARE: "productos/software-de-medicion-calidad-del-aire.html",
  "SOFTWARE-corta": "productos/kunak-api.html",
};
for (const [k, v] of Object.entries(ANCLAS)) {
  if (!firmaB.has(v)) { console.error(`❌ PRECONDICION: falta el ancla ${k} -> ${v}`); process.exit(1); }
}

const vacios = [...firmaB].filter(([, s]) => s.size === 0).length;
ctl(vacios < DOCS.length,
  "la firma B no está vacía en TODOS (si lo estuviera, el predicado no casa — §sondas 4)",
  `${DOCS.length - vacios}/${DOCS.length} con marcador · ${vacios} sin ninguno`);

/* ¿El `<style>`/`<script>` mueve la firma B? Es la MEDIDA SECUNDARIA que dice
   si B hereda el defecto que la firma A ya sabía evitar. */
const difB = [...firmaB].filter(([r, s]) => s.size !== firmaBlimpia.get(r).size);
ctl(true,
  "MEDIDA SECUNDARIA · ¿mueve la firma B quitar `<style>`/`<script>`? (informativa, no cierra)",
  `${difB.length}/${DOCS.length} documentos cambian de cardinal · ${difB.length === 0 ? "B es INMUNE al canal que contaminaba a A" : "B TAMBIÉN se contamina"}`);

const UMBRAL = 0.7; // el criterio de la 123/126/127.ª — se hereda el criterio, no el número

const familias = {};
for (const [arq, ancla] of Object.entries(ANCLAS)) {
  const sA = firmaB.get(ancla), tA = firmaA.get(ancla);
  const filas = [];
  for (const [r, sB] of firmaB) {
    if (r === ancla) continue;
    const jB = jaccard(sA, sB), jA = jaccard(tA, firmaA.get(r));
    if (jB >= UMBRAL || jA >= UMBRAL || solape(sA, sB) >= 0.9) {
      filas.push({ doc: r, jaccardB: jB, jaccardA: jA, solapeB: solape(sA, sB), superaB: jB >= UMBRAL, superaA: jA >= UMBRAL });
    }
  }
  filas.sort((x, y) => y.jaccardB - x.jaccardB || y.solapeB - x.solapeB);
  const nB = filas.filter((f) => f.superaB).length;
  familias[arq] = {
    ancla,
    marcadoresB: sA.size,
    elementosB: [...sA].sort(),
    tiposA: tA.size,
    cardinalAlcanzableB: cardinalAlcanzable(sA.size, UMBRAL),
    hermanasB: nB,
    hermanasA: filas.filter((f) => f.superaA).length,
    n_por_B: nB + 1,
    candidatos: filas.slice(0, 30),
  };
}

/* Que el umbral DISCRIMINE se comprueba sobre LAS CUATRO anclas, no sobre una:
   un control con dominio más estrecho que su invariante no protege, BLOQUEA
   (§regla 25). Y se publica el reparto por ancla, no el booleano (§regla 22). */
const reparto = Object.entries(familias).map(([k, v]) => `${k}:${v.hermanasB}`);
const algunaArriba = Object.values(familias).some((v) => v.hermanasB > 0);
const algunaAbajo = Object.values(familias).some((v) => v.hermanasB === 0);
ctl(algunaArriba && algunaAbajo,
  `el umbral B DISCRIMINA sobre las 4 anclas (ni pleno ni cero), n=${DOCS.length} por ancla`,
  `hermanas por ancla: ${reparto.join(" · ")}`);

/* ⚠ AUDITORÍA DEL CERO · «0 hermanas» es cierto, ¿y de QUÉ es propiedad? Un
   marcador presente en casi todo no discrimina (§*un patrón que casa en TODAS
   tampoco mide nada*), así que la firma útil de un ancla no es su cardinal
   sino cuántos de sus marcadores son DISTINTIVOS. Si a un ancla le queda 1,
   ninguna métrica de conjunto puede encontrarle familia — y entonces el cero
   es del INSTRUMENTO, no del corpus. Se deriva, con su máximo declarado. */
const ubicuidad = new Map();
for (const [, s] of firmaB) for (const c of s) ubicuidad.set(c, (ubicuidad.get(c) ?? 0) + 1);
const CON_MARCADOR = DOCS.length - vacios;
const UBICUO = 0.5; // presente en >=50 % de los documentos QUE TIENEN marcador
const esUbicuo = (c) => (ubicuidad.get(c) ?? 0) / CON_MARCADOR >= UBICUO;

for (const [arq, h] of Object.entries(familias)) {
  const sA = firmaB.get(h.ancla);
  const dist = [...sA].filter((c) => !esUbicuo(c)).sort();
  h.ubicuidadPorMarcador = Object.fromEntries([...sA].sort().map((c) => [c, `${ubicuidad.get(c)}/${CON_MARCADOR}`]));
  h.marcadoresDistintivos = dist.length;
  h.elementosDistintivos = dist;
}
const minDist = Math.min(...Object.values(familias).map((h) => h.marcadoresDistintivos));
ctl(minDist >= 2,
  "AUDITORÍA DEL CERO · toda ancla conserva >=2 marcadores DISTINTIVOS (con 1 o 0 ninguna métrica de conjunto puede hallar familia, y el cero sería del instrumento)",
  Object.entries(familias).map(([k, h]) => `${k}: ${h.marcadoresDistintivos}/${h.marcadoresB} distintivos {${h.elementosDistintivos.join(",")}}`).join(" · "));

/* Y su contraste, que es lo que convierte el cero en dato: re-medir el
   emparejamiento SÓLO sobre los marcadores distintivos. Si con la firma
   reducida siguen saliendo 0 hermanas, el cero sobrevive a su propia crítica;
   si aparecen, el cero era del ruido ubicuo. */
const distDe = (r) => new Set([...firmaB.get(r)].filter((c) => !esUbicuo(c)));
const familiasDistintivas = {};
for (const [arq, ancla] of Object.entries(ANCLAS)) {
  const dA = distDe(ancla);
  const filas = [];
  for (const r of firmaB.keys()) {
    if (r === ancla) continue;
    const dB = distDe(r);
    if (dB.size === 0) continue;
    const j = jaccard(dA, dB);
    if (j >= UMBRAL) filas.push({ doc: r, j });
  }
  filas.sort((x, y) => y.j - x.j);
  familiasDistintivas[arq] = { marcadores: dA.size, elementos: [...dA].sort(), hermanas: filas.length, n: filas.length + 1, lista: filas.slice(0, 20) };
}

/* ═══ 5 · LOS 17 CARTUCHOS + 1 SENSOR, uno a uno y NOMBRADOS ═══════════ */
const CARTUCHOS = DOCS.map(rel).filter((r) => /^productos\/(cartuchos-inteligentes|sensor-de-calidad-del-aire)\//.test(r));
const sCat = firmaB.get(ANCLAS.CATALOGO);
const detalleCartuchos = CARTUCHOS.map((r) => {
  const s = firmaB.get(r), t = firmaA.get(r), f = fichaDoc.get(r);
  const contra = Object.fromEntries(Object.entries(ANCLAS).map(([k, a]) => [k, {
    B: jaccard(s, firmaB.get(a)), A: jaccard(t, firmaA.get(a)), solapeB: solape(s, firmaB.get(a)),
  }]));
  const mejor = Object.entries(contra).sort((x, y) => y[1].B - x[1].B)[0];
  return {
    doc: r, regimen: f.regimen, cpt: f.cpt, plantilla: f.plantilla,
    marcadoresB: s.size, elementosB: [...s].sort(), tiposA: t.size,
    compartidosConCatalogo: [...s].filter((x) => sCat.has(x)).sort(),
    soloEnCatalogo: [...sCat].filter((x) => !s.has(x)).sort(),
    contra, mejorArquetipoB: mejor[0], mejorJaccardB: mejor[1].B,
  };
});
const superan = detalleCartuchos.filter((d) => d.contra.CATALOGO.B >= UMBRAL);

/* ¿Son los 18 IGUALES entre sí? Si lo son, forman UNA familia propia, y esa es
   una respuesta distinta de «no son CATÁLOGO». Se mide, no se supone. */
const paresCart = [];
for (let i = 0; i < CARTUCHOS.length; i++)
  for (let j = i + 1; j < CARTUCHOS.length; j++)
    paresCart.push({ a: CARTUCHOS[i], b: CARTUCHOS[j], jB: jaccard(firmaB.get(CARTUCHOS[i]), firmaB.get(CARTUCHOS[j])) });
const cartHomogeneos = paresCart.filter((p) => p.jB >= UMBRAL).length;

/* ═══ 6 · LAS HOJAS `et-cache` DE LAS 4 ANCLAS ═════════════════════════ */
/* Re-derivado, NO heredado de la 127.ª, que lo midió sobre otro alcance
   (§*una medida contesta las preguntas que se le hicieron*). */
const CSS_DIR = join(CORPUS, "css");
function todosLosCss(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) todosLosCss(p, acc);
    else if (e.name.endsWith(".css")) acc.push(e.name);
  }
  return acc;
}
const nombreCss = new Set(todosLosCss(CSS_DIR));
ctl(nombreCss.size > 0, "hay CSS capturado que cruzar (si diera 0, el cruce no mide — §sondas 4)", `${nombreCss.size} ficheros .css`);

const etCache = {};
for (const [arq, ancla] of Object.entries(ANCLAS)) {
  const html = readFileSync(join(CORPUS, ancla), "utf8");
  const links = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi)]
    .map((m) => (m[0].match(/href=["']([^"']+)["']/i) || [])[1]).filter(Boolean);
  const det = links.map((h) => {
    const limpio = h.split("?")[0];
    const base = limpio.split("/").pop();
    return { href: h, base, capturada: nombreCss.has(base), esEtCache: /et-cache/.test(limpio) };
  });
  const etc = det.filter((d) => d.esEtCache);
  etCache[arq] = {
    enlazadas: det.length,
    capturadas: det.filter((d) => d.capturada).length,
    ausentes: det.filter((d) => !d.capturada).map((d) => d.base),
    etCacheEnlazadas: etc.length,
    etCacheAusentes: etc.filter((d) => !d.capturada).map((d) => d.base),
    bytesInline: [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].reduce((a, m) => a + m[1].length, 0),
  };
}
ctl(Object.values(etCache).some((e) => e.enlazadas > 0),
  "el detector de hojas enlazadas casa en alguna (0 en todas sería el selector — §sondas 4)",
  Object.entries(etCache).map(([k, v]) => `${k}=${v.enlazadas}`).join(" · "));

/* ═══ SALIDA ═══════════════════════════════════════════════════════════ */
const veredictoCartuchos = superan.length >= 1
  ? `CATÁLOGO SÍ tiene familia: ${superan.length} de ${CARTUCHOS.length} superan J_B>=${UMBRAL}`
  : `CATÁLOGO NO tiene familia por firma B: 0 de ${CARTUCHOS.length} superan J_B>=${UMBRAL}`;

const salida = {
  fecha: HOY, tanda: 128, escalon: "PASO 0",
  pregunta: "¿tienen familia CATÁLOGO · SOFTWARE · SOFTWARE-corta, o están a n=1 por construcción?",
  alcance: {
    documentosRecorridos: DOCS.length, unidad: "documento HTML del corpus", umbralJaccard: UMBRAL,
    firmaVeredicto: "B (marcadores semánticos, criterio de paso0-dominio-127.mjs) — la llave con la que la sonda de varianza empareja",
    firmaControl: "A (tipos de módulo, criterio de familia-producto-123.mjs) — sólo reproducción",
    noContesta: ["no mide varianza", "no mide cascada", "no toca red ni clon ni DB", "no dice si el umbral 0.7 es el correcto: hereda el criterio"],
  },
  controles,
  censoRegimen: {
    total: DOCS.length,
    porCodigo: Object.fromEntries([...porRegimen].sort((a, b) => b[1] - a[1])),
    porDirectorio: Object.fromEntries([...porDir].map(([d, m]) => [d, Object.fromEntries([...m])])),
  },
  reproduccion123: { pares: `${nCasan}/${todosPares.length}`, cardinales: `${nTiposOk}/${reproA.length}`, detalle: reproA },
  medidaSecundariaFirmaB: { documentosQueCambian: difB.length, de: DOCS.length, lectura: difB.length === 0 ? "B es inmune a `<style>`/`<script>`" : "B también se contamina" },
  familias,
  auditoriaDelCero: {
    criterioUbicuo: `presente en >=${UBICUO * 100} % de los ${CON_MARCADOR} documentos CON marcador`,
    ubicuosDelCorpus: [...ubicuidad].filter(([c]) => esUbicuo(c)).sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c}=${n}/${CON_MARCADOR}`),
    familiasSoloConDistintivos: familiasDistintivas,
  },
  cartuchos: { n: CARTUCHOS.length, veredicto: veredictoCartuchos, superanCatalogo: superan.length, paresEntreSi: paresCart.length, paresHomogeneos: cartHomogeneos, detalle: detalleCartuchos },
  etCache,
};

const SALIDA = process.env.SALIDA || "paso0-censo-128";
const escribe = (ext, contenido) => {
  const dest = join(DERIV, `${SALIDA}.${ext}`);
  if (existsSync(dest) && readFileSync(dest, "utf8") !== contenido && !process.env.PISAR) {
    const alt = join(DERIV, `${SALIDA}-${HOY}.${ext}`);
    console.log(`⚠ ${SALIDA}.${ext} existe y DIFIERE — escribo al lado en ${basename(alt)} (§regla 5)`);
    writeFileSync(alt, contenido);
  } else writeFileSync(dest, contenido);
};
escribe("json", JSON.stringify(salida, null, 1));

/* ── INFORME ── */
const L = [];
L.push(`=== 128.ª · PASO 0 · CENSO Y FAMILIAS — ${HOY} ===`);
L.push("");
L.push("=== CONTROLES ===");
for (const c of controles) L.push(`  ${c.ok ? "OK " : "❌ "} ${c.nombre}\n      ${c.detalle}`);
L.push("");
L.push(`=== 1 · RÉGIMEN · ${DOCS.length} documentos, unidad = documento ===`);
for (const [k, v] of [...porRegimen].sort((a, b) => b[1] - a[1])) L.push(`  ${k}  ${String(v).padStart(4)}`);
L.push("");
L.push("  por directorio de primer nivel:");
for (const [d, m] of [...porDir].sort()) L.push(`    ${d.padEnd(24)} ${[...m].sort().map(([k, v]) => `${k}=${v}`).join(" ")}`);
L.push("");
L.push(`=== 2 · REPRODUCCIÓN DE LA 123.ª (firma A) · pares ${nCasan}/${todosPares.length} · cardinales ${nTiposOk}/${reproA.length} ===`);
for (const r of reproA) {
  if (!r.pares) { L.push(`  ${r.doc}: ${r.estado}`); continue; }
  L.push(`  ${r.doc.padEnd(42)} tipos ayer=${r.tiposAyer} hoy=${r.tiposHoy} ${r.tiposOk ? "OK" : "❌"}`);
  for (const p of r.pares) L.push(`      ${String(p.otro).padEnd(42)} ayer=${p.ayer} hoy=${p.hoy} ${p.casa ? "OK" : "❌"}`);
}
L.push("");
L.push(`=== 3 · FAMILIAS · J_B>=${UMBRAL} sobre los ${DOCS.length} documentos ===`);
for (const [arq, h] of Object.entries(familias)) {
  L.push(`  ${arq.padEnd(16)} ancla=${h.ancla}`);
  L.push(`      firma B: ${h.marcadoresB} marcadores → hermanas ${h.hermanasB}  ⇒  n = ${h.n_por_B}   (|B| alcanzable <= ${h.cardinalAlcanzableB})`);
  L.push(`        {${h.elementosB.join(", ")}}`);
  L.push(`      firma A: ${h.tiposA} tipos      → hermanas ${h.hermanasA}`);
  for (const f of h.candidatos.slice(0, 6)) L.push(`        ${f.doc.padEnd(56)} B=${f.jaccardB} solB=${f.solapeB} A=${f.jaccardA}`);
  if (h.candidatos.length > 6) L.push(`        … y ${h.candidatos.length - 6} candidatos más`);
}
L.push("");
L.push(`=== 3b · AUDITORÍA DEL CERO · ubicuidad (>=${UBICUO * 100} % de los ${CON_MARCADOR} con marcador) ===`);
L.push(`  ubicuos del corpus: ${[...ubicuidad].filter(([c]) => esUbicuo(c)).sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c}=${n}`).join(" · ") || "(ninguno)"}`);
for (const [arq, h] of Object.entries(familias)) {
  const d = familiasDistintivas[arq];
  L.push(`  ${arq.padEnd(16)} ${h.marcadoresDistintivos}/${h.marcadoresB} distintivos {${h.elementosDistintivos.join(", ")}}`);
  L.push(`      sólo con distintivos → hermanas ${d.hermanas} ⇒ n = ${d.n}${d.lista.length ? "  ej: " + d.lista.slice(0, 3).map((x) => `${x.doc}=${x.j}`).join(" ") : ""}`);
}
L.push("");
L.push(`=== 4 · LOS ${CARTUCHOS.length} CARTUCHOS/SENSOR CONTRA CATÁLOGO ===`);
L.push(`  VEREDICTO: ${veredictoCartuchos}`);
L.push(`  homogeneidad interna: ${cartHomogeneos}/${paresCart.length} pares entre ellos con J_B>=${UMBRAL}`);
const grupos = new Map();
for (const d of detalleCartuchos) {
  const k = `${d.marcadoresB}|${d.elementosB.join(",")}|${d.contra.CATALOGO.B}|${d.contra.CATALOGO.solapeB}`;
  if (!grupos.has(k)) grupos.set(k, []);
  grupos.get(k).push(basename(d.doc));
}
L.push(`  ${grupos.size} firma(s) distinta(s) entre los ${CARTUCHOS.length}:`);
for (const [k, docs] of grupos) {
  const [n, els, jb, sb] = k.split("|");
  L.push(`    n=${docs.length}  marcadores=${n}  J_B(CATALOGO)=${jb}  solape=${sb}`);
  L.push(`      {${els}}`);
  L.push(`      ${docs.join(" ")}`);
}
const ej = detalleCartuchos[0];
if (ej) {
  L.push(`  CATÁLOGO tiene {${[...sCat].sort().join(", ")}}`);
  L.push(`  compartidos con el 1.º cartucho: {${ej.compartidosConCatalogo.join(", ")}} · sólo en CATÁLOGO: {${ej.soloEnCatalogo.join(", ")}}`);
}
L.push("");
L.push("=== 5 · HOJAS `et-cache` DE LAS 4 ANCLAS (re-derivado, no heredado) ===");
for (const [k, v] of Object.entries(etCache)) {
  L.push(`  ${k.padEnd(16)} enlazadas=${v.enlazadas} capturadas=${v.capturadas} ausentes=${v.ausentes.length} · et-cache ${v.etCacheEnlazadas} (ausentes ${v.etCacheAusentes.length}) · inline=${v.bytesInline}B`);
  if (v.ausentes.length) L.push(`      ausentes: ${v.ausentes.join(" ")}`);
}
L.push("");
const malos = controles.filter((c) => !c.ok);
L.push(malos.length ? `VEREDICTO: ${malos.length} CONTROL(ES) EN ROJO — el censo NO adjudica` : "VEREDICTO: controles en verde");
L.push(`✓ evaluadas ${DOCS.length}/${DOCS.length} documentos · régimen y firma`);

const log = L.join("\n") + "\n";
escribe("log", log);
console.log(log);
process.exit(malos.length ? 2 : 0);
