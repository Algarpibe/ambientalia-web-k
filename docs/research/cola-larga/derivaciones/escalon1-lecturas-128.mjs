// 128.ª · ESCALÓN 1 — LAS LECTURAS QUE HOY ENGAÑAN, Y EL REPARTO QUE NO CIERRA.
//
// Dos cosas, las dos baratas y las dos mintiendo ahora mismo:
//
// (a) TRES LECTURAS de la tabla de estado de `PLAN-FASE-3.md` contradichas por
//     el PROPIO documento. La salida es BORRAR una, no conciliarlas con una
//     nota al pie: mientras las dos estén escritas, la nota es una tercera
//     lectura (§*una lectura se BORRA, nunca se concilia*).
//
//     ⚠ Y la de F3-5 es §*corregir un denominador no es sustituirlo en todas
//     partes*: se BARRE dónde vive el 46, se CLASIFICA cada aparición POR SU
//     UNIDAD, y sólo entonces se sustituye. Un mismo conjunto puede tener dos
//     cardinales ciertos a la vez, uno por unidad.
//
// (b) EL REPARTO DEL LOTE NO CIERRA. En `escalon1-varianza-127-control-lote`:
//        pares 52 · CAMPO 2 · PLANTILLA 10 · SIN_ESCRIBIR 40 · SIN_PROBAR 0
//        · varianzaEstructural 4     →  suma 56 ≠ 52
//     El de la familia cierra exacto (132 = 132) y NO PUEDE delatarlo, porque
//     sus dos claves extra valen 0. Se DERIVA del `detalle` si los 4
//     estructurales están DENTRO de los 10 PLANTILLA —o sea si el juego de
//     claves es una PARTICIÓN o lleva un sub-recuento sin declarar (§regla 14
//     con el contenedor puesto en el juego de claves).
//
// LO QUE NO CONTESTA: no mide nada nuevo del original. Lee congeladas y
// documentos. OFFLINE.
//
// ALCANCE: los 2 JSON congelados de la 127.ª + barrido de `docs/` y
// `packages/` por el literal.

import { readFileSync, existsSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, basename } from "node:path";

const RAIZ = process.cwd();
const DERIV = join(RAIZ, "docs/research/cola-larga/derivaciones");
const LOTE = join(DERIV, "escalon1-varianza-127-control-lote.json");
const FAMILIA = join(DERIV, "escalon1-varianza-127.json");

/* ── PRECONDICIONES ANTES DE GASTAR NADA (§regla 37) ────────────────────── */
const faltan = [LOTE, FAMILIA].filter((p) => !existsSync(p)).map((p) => relative(RAIZ, p));
if (faltan.length) { console.error(`❌ PRECONDICION: faltan ${faltan.join(", ")}`); process.exit(1); }

const controles = [];
const ctl = (ok, nombre, detalle) => controles.push({ ok, nombre, detalle });
const HOY = new Date().toISOString().slice(0, 10);

/* ═══ (b) EL REPARTO · ¿PARTICIÓN O SUB-RECUENTO? ══════════════════════ */
const lote = JSON.parse(readFileSync(LOTE, "utf8"));
const fam = JSON.parse(readFileSync(FAMILIA, "utf8"));

/* El `detalle` es la unidad; el resumen es el nivel de arriba. Se deriva del
   detalle, no se supone (§*se compara en la unidad que se afirma*). */
function analiza(j, etiqueta) {
  const det = j.detalle ?? j.pares ?? j.resultados ?? null;
  if (!Array.isArray(det)) return { etiqueta, error: `no encuentro el detalle (claves: ${Object.keys(j).join(",")})` };
  const porVeredicto = new Map();
  let conEstructural = 0;
  const cruce = new Map(); // veredicto × ¿tiene marca estructural?
  for (const p of det) {
    const v = p.veredicto ?? p.estado ?? "(sin veredicto)";
    porVeredicto.set(v, (porVeredicto.get(v) ?? 0) + 1);
    const est = Boolean(p.varianzaEstructural ?? p.estructural ?? p.esEstructural);
    if (est) conEstructural++;
    const k = `${v} | estructural=${est}`;
    cruce.set(k, (cruce.get(k) ?? 0) + 1);
  }
  return {
    etiqueta,
    pares: det.length,
    porVeredicto: Object.fromEntries([...porVeredicto].sort()),
    conMarcaEstructural: conEstructural,
    cruce: Object.fromEntries([...cruce].sort()),
    resumenPublicado: j.resumen ?? j.reparto ?? null,
    clavesDelJson: Object.keys(j),
  };
}
const aLote = analiza(lote, "LOTE (4 arquetipos)");
const aFam = analiza(fam, "FAMILIA PRODUCTO (3 instancias)");

ctl(!aLote.error && !aFam.error,
  "el `detalle` de las dos congeladas se puede recorrer (si no, no se puede derivar nada)",
  aLote.error || aFam.error || `lote ${aLote.pares} pares · familia ${aFam.pares} pares`);

/* La comprobación que decide: ¿suman los veredictos los pares? Si sí, los
   veredictos SON una partición y `varianzaEstructural` es un SUB-RECUENTO. */
function cierra(a) {
  if (a.error) return null;
  const suma = Object.values(a.porVeredicto).reduce((x, y) => x + y, 0);
  return { suma, pares: a.pares, cierra: suma === a.pares, exceso: suma - a.pares };
}
const cLote = cierra(aLote), cFam = cierra(aFam);
ctl(cLote?.cierra && cFam?.cierra,
  "LOS VEREDICTOS SON UNA PARTICIÓN de los pares en las dos congeladas",
  `lote ${cLote?.suma}/${cLote?.pares} ${cLote?.cierra ? "CIERRA" : `EXCESO ${cLote?.exceso}`} · familia ${cFam?.suma}/${cFam?.pares} ${cFam?.cierra ? "CIERRA" : `EXCESO ${cFam?.exceso}`}`);

/* Y si cierra, la pregunta siguiente: ¿DÓNDE caen los estructurales? */
const dondeCaen = (a) => Object.entries(a.cruce).filter(([k]) => k.endsWith("estructural=true"));
ctl(true,
  "SUB-RECUENTO · dónde caen los pares con marca de varianza estructural (informativo)",
  `lote: ${dondeCaen(aLote).map(([k, v]) => `${k.split(" |")[0]}=${v}`).join(" · ") || "(ninguno)"} · familia: ${dondeCaen(aFam).map(([k, v]) => `${k.split(" |")[0]}=${v}`).join(" · ") || "(ninguno)"}`);

/* ═══ (a) EL BARRIDO DEL 46 · CLASIFICADO POR UNIDAD ══════════════════ */
/* Un barrido por literal sólo ve las formas que enumera (§regla 9, la mitad de
   la GRAMÁTICA). Se buscan las tres formas en que este proyecto escribe un
   cardinal: el número solo, con negrita, y con su sustantivo. Y se publica
   cuántas líneas son COMENTARIO, que es el falso positivo conocido. */
const EXTS = /\.(md|ts|tsx|mjs|json)$/;
const IGNORA = /node_modules|\.next|\.git|dist|build/;
function ficheros(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (IGNORA.test(p.replace(/\\/g, "/"))) continue;
    if (e.isDirectory()) ficheros(p, acc);
    else if (EXTS.test(e.name)) acc.push(p);
  }
  return acc;
}
const AMBITO = ["docs", "packages", "scripts"].map((d) => join(RAIZ, d)).filter(existsSync);
const FICHEROS = AMBITO.flatMap((d) => ficheros(d));

/* Las apariciones de «46» que puedan ser ESTE 46: el número pegado a SIN
   PROBAR, a «pares», a «ejes», o dentro de una frase de F3-5. */
const PATRONES = [
  { nombre: "46 + SIN PROBAR", re: /46[^\n]{0,40}SIN PROBAR|SIN PROBAR[^\n]{0,40}\b46\b/i },
  { nombre: "46 + pares/ejes", re: /\b46\b[^\n]{0,30}(pares|ejes)|\b(pares|ejes)\b[^\n]{0,30}\b46\b/i },
  { nombre: "de 46 / los 46", re: /\b(de|los|las)\s+46\b/i },
];
const hits = [];
for (const f of FICHEROS) {
  const src = readFileSync(f, "utf8");
  if (!/\b46\b/.test(src)) continue;
  src.split(/\r?\n/).forEach((linea, i) => {
    const cuales = PATRONES.filter((p) => p.re.test(linea)).map((p) => p.nombre);
    if (!cuales.length) return;
    const esComentario = /^\s*(\/\/|\/\*|\*|#|>)/.test(linea);
    hits.push({
      fichero: relative(RAIZ, f).replace(/\\/g, "/"),
      linea: i + 1,
      patrones: cuales,
      esComentario,
      texto: linea.trim().slice(0, 220),
    });
  });
}
ctl(hits.length > 0,
  "el barrido del 46 CASA en algo (0 sería el filtro y no el repo — §sondas 4)",
  `${hits.length} líneas en ${new Set(hits.map((h) => h.fichero)).size} ficheros · ${hits.filter((h) => h.esComentario).length} son comentario/cita`);

/* ═══ (a) LAS DOS LECTURAS DE F3-3 y F3-4 ════════════════════════════ */
/* La coordenada se DERIVA, no se cita: una coordenada envejece con el fichero
   (§regla 19). Se busca la FILA DE TABLA, anclada a estructura. */
const PLAN = join(RAIZ, "docs/PLAN-FASE-3.md");
if (!existsSync(PLAN)) { console.error("❌ PRECONDICION: falta docs/PLAN-FASE-3.md"); process.exit(1); }
const planL = readFileSync(PLAN, "utf8").split(/\r?\n/);
const filaEstado = (fase) => {
  const idx = planL.findIndex((l) => l.startsWith("|") && l.includes(`**${fase}**`) && /pendiente/.test(l) && l.length < 200);
  return idx === -1 ? null : { linea: idx + 1, texto: planL[idx] };
};
const contradichas = {};
for (const fase of ["F3-3", "F3-4"]) {
  const fila = filaEstado(fase);
  /* La contradicción se deriva del propio documento: su sección la da por
     cerrada. Se busca el marcador de cierre dentro de su sección. */
  const iSec = planL.findIndex((l) => /^##\s/.test(l) && l.includes(fase));
  const fin = planL.findIndex((l, k) => k > iSec && /^##\s/.test(l));
  const seccion = iSec === -1 ? [] : planL.slice(iSec, fin === -1 ? planL.length : fin);
  const cierres = seccion
    .map((l, k) => ({ linea: iSec + k + 1, t: l }))
    .filter((x) => /✅✅|FASE COMPLETA|EMISIÓN ESTÁ HECHA|DECIDIDA POR EL PROPIETARIO/.test(x.t))
    .slice(0, 3)
    .map((x) => ({ linea: x.linea, texto: x.t.slice(0, 180) }));
  contradichas[fase] = { filaDeEstado: fila, seccionEmpiezaEn: iSec + 1, cierresEnSuSeccion: cierres.length, ejemplos: cierres };
}
ctl(Object.values(contradichas).every((c) => c.filaDeEstado && c.cierresEnSuSeccion > 0),
  "las dos filas «pendiente» EXISTEN y su propia sección las contradice (si no, no hay nada que borrar)",
  Object.entries(contradichas).map(([k, v]) => `${k}: fila L${v.filaDeEstado?.linea ?? "?"} · ${v.cierresEnSuSeccion} cierres en su §`).join(" · "));

/* ═══ SALIDA ═══════════════════════════════════════════════════════════ */
const salida = {
  fecha: HOY, tanda: 128, escalon: 1,
  pregunta: "¿cierra el reparto del LOTE, y dónde vive el 46 con su unidad?",
  alcance: {
    congeladasLeidas: [relative(RAIZ, LOTE), relative(RAIZ, FAMILIA)].map((p) => p.replace(/\\/g, "/")),
    ficherosBarridos: FICHEROS.length,
    ambito: AMBITO.map((d) => relative(RAIZ, d)),
    noContesta: ["no mide nada nuevo del original", "no dice si el 46 es correcto: dice dónde vive y en qué unidad"],
  },
  controles,
  reparto: { lote: { ...aLote, cierre: cLote }, familia: { ...aFam, cierre: cFam } },
  barrido46: { lineas: hits.length, ficheros: [...new Set(hits.map((h) => h.fichero))], comentarios: hits.filter((h) => h.esComentario).length, detalle: hits },
  lecturasContradichas: contradichas,
};
const SALIDA = process.env.SALIDA || "escalon1-lecturas-128";
const escribe = (ext, c) => {
  const d = join(DERIV, `${SALIDA}.${ext}`);
  if (existsSync(d) && readFileSync(d, "utf8") !== c && !process.env.PISAR) {
    console.log(`⚠ ${SALIDA}.${ext} existe y DIFIERE — escribo al lado (§regla 5)`);
    writeFileSync(join(DERIV, `${SALIDA}-${HOY}.${ext}`), c);
  } else writeFileSync(d, c);
};
escribe("json", JSON.stringify(salida, null, 1));

const L = [];
L.push(`=== 128.ª · ESCALÓN 1 · LECTURAS Y REPARTO — ${HOY} ===`);
L.push("");
L.push("=== CONTROLES ===");
for (const c of controles) L.push(`  ${c.ok ? "OK " : "❌ "} ${c.nombre}\n      ${c.detalle}`);
L.push("");
L.push("=== (b) EL REPARTO, DERIVADO DEL `detalle` ===");
for (const a of [aLote, aFam]) {
  if (a.error) { L.push(`  ${a.etiqueta}: ${a.error}`); continue; }
  const c = cierra(a);
  L.push(`  ${a.etiqueta} · ${a.pares} pares`);
  L.push(`      veredictos: ${Object.entries(a.porVeredicto).map(([k, v]) => `${k}=${v}`).join(" · ")}`);
  L.push(`      suma ${c.suma} vs pares ${c.pares} ⇒ ${c.cierra ? "PARTICIÓN" : `EXCESO ${c.exceso}`}`);
  L.push(`      con marca estructural: ${a.conMarcaEstructural}`);
  for (const [k, v] of Object.entries(a.cruce)) L.push(`        ${k} → ${v}`);
  if (a.resumenPublicado) L.push(`      resumen PUBLICADO: ${JSON.stringify(a.resumenPublicado)}`);
}
L.push("");
L.push(`=== (a) BARRIDO DEL 46 · ${hits.length} líneas · ${hits.filter((h) => h.esComentario).length} comentario/cita ===`);
for (const h of hits) L.push(`  ${h.fichero}:${h.linea} ${h.esComentario ? "[cita]" : "[texto]"} (${h.patrones.join("+")})\n      ${h.texto}`);
L.push("");
L.push("=== (a) LAS DOS FILAS «pendiente» CONTRADICHAS POR SU PROPIA SECCIÓN ===");
for (const [f, c] of Object.entries(contradichas)) {
  L.push(`  ${f}  fila de estado L${c.filaDeEstado?.linea ?? "NO HALLADA"}: ${c.filaDeEstado?.texto?.slice(0, 120) ?? ""}`);
  L.push(`      su § empieza en L${c.seccionEmpiezaEn} y trae ${c.cierresEnSuSeccion} marcador(es) de cierre:`);
  for (const e of c.ejemplos) L.push(`        L${e.linea}: ${e.texto}`);
}
L.push("");
const malos = controles.filter((c) => !c.ok);
L.push(malos.length ? `VEREDICTO: ${malos.length} CONTROL(ES) EN ROJO` : "VEREDICTO: controles en verde");
L.push(`✓ evaluadas ${FICHEROS.length}/${FICHEROS.length} ficheros barridos · 2/2 congeladas leídas`);
const log = L.join("\n") + "\n";
escribe("log", log);
console.log(log);
process.exit(malos.length ? 2 : 0);
