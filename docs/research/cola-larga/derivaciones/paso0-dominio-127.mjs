// 127.ª · PASO 0 — EL DOMINIO, DERIVADO HOY. Y las cifras de ayer son cifras.
//
// El encargo trae tres números de la 126.ª —«21 marcadores en la familia
// PRODUCTO, 18 en >=2 documentos, contra 7 en el lote»— y §regla 9 no hace
// excepción con las propias: **un número recordado y uno derivado se escriben
// igual y no valen lo mismo**. Aquí se vuelven a sacar y se publica si
// reproducen.
//
// LO QUE ESTE PASO CONTESTA, y sólo esto:
//
//   1 · ¿reproducen 21 · 18 · 3 (familia PRODUCTO, censo OFFLINE de la 126.ª)?
//   2 · ¿reproduce 18 · 7 · 11 (lote de 4 arquetipos, censo de la 125.ª)?
//       ⚠ y aquí hay una trampa declarada: la 125.ª censó CON NAVEGADOR y
//       filtro CON CAJA; la 126.ª censó OFFLINE por regex. Son dos CRITERIOS
//       DE RECUENTO, así que un desacuerdo entre ellos no es del dato — es de
//       la pregunta (§regla 31 hermana). Se corre el criterio offline sobre el
//       lote para que el cruce compare lo mismo, y se publican LOS DOS.
//   3 · ¿cuántos de los 46 SIN PROBAR pueden siquiera MOVERSE? Sólo los pares
//       cuyo marcador esté también en la familia. Es la intersección, y acota
//       el techo de la tanda antes de gastarla.
//   4 · de los 46, ¿cuántos son SIN ESCRIBIR —único valor observado = el
//       inicial de la propiedad— y cuántos traen valor? Es §*la premisa callada
//       del test A*, y cambia la predicción: un eje sin declaración no tiene
//       cascada a la que preguntar.
//   5 · ¿QUÉ RÉGIMEN tienen los 3 documentos? Es PRECONDICIÓN, no adorno: en
//       `B-` la varianza inter-instancia la escribió quien editó cada página;
//       en `-T`/`--` no existe esa persona y la lectura SE INVIERTE. Nadie ha
//       mirado el `<body>` de los 2 vecinos.
//
// LO QUE NO CONTESTA: no mide varianza. Eso es el ESCALÓN 1.
//
// ALCANCE: 3 documentos de la familia PRODUCTO + los 4 del lote, offline.

import { readFileSync, existsSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const CORPUS = join(RAIZ, "corpus/productos");
const DERIV = join(RAIZ, "docs/research/cola-larga/derivaciones");
const FAMILIA = join(DERIV, "familia-producto-123.json");
const VARIANZA125 = join(DERIV, "escalon4-varianza-125.json");

/* ── PRECONDICIONES ANTES DE GASTAR NADA (§regla 37) ──────────────────────── */
const faltan = [];
for (const p of [FAMILIA, VARIANZA125, CORPUS]) if (!existsSync(p)) faltan.push(p);
if (faltan.length) { console.error(`❌ PRECONDICION: faltan ${faltan.join(", ")}`); process.exit(1); }

const controles = [];
const ctl = (ok, nombre, detalle) => controles.push({ ok, nombre, detalle });

/* ═══ VECINOS — se DERIVAN del Jaccard congelado, no se recuerdan ═════════ */
const UMBRAL = 0.7;
const ANCLA = "monitor-calidad-aire";
const logFam = join(DERIV, "familia-producto-123.log");
if (!existsSync(logFam)) { console.error(`❌ PRECONDICION: falta ${logFam}`); process.exit(1); }
const lineaFam = readFileSync(logFam, "utf8").split(/\r?\n/).find((l) => l.trim().startsWith(ANCLA));
if (!lineaFam) { console.error(`❌ el log no trae la fila de ${ANCLA}`); process.exit(1); }
/* La guarda `<= 1` es la de la 126.ª y NO es cosmética: el regex casa también
   `tipos=10`, el cardinal de la cabecera. Un Jaccard vive en [0,1] por
   definición, así que la guarda se DERIVA del objeto. */
const vecinos = [...lineaFam.matchAll(/([a-z0-9-]+)=([\d.]+)/g)]
  .map((m) => ({ doc: m[1], jaccard: Number(m[2]) }))
  .filter((v) => v.jaccard >= UMBRAL && v.jaccard <= 1);

const enCorpus = readdirSync(CORPUS).filter((f) => f.endsWith(".html"));
const resueltos = vecinos.map((v) => ({ ...v, fichero: enCorpus.find((x) => x.startsWith(v.doc.replace(/-$/, ""))) ?? null }));
ctl(resueltos.length === 2 && resueltos.every((r) => r.fichero),
  "los 2 vecinos se DERIVAN del Jaccard congelado y RESUELVEN contra el corpus",
  resueltos.map((r) => `${r.doc}=${r.jaccard} -> ${r.fichero ?? "SIN RESOLVER"}`).join(" · "));

/* ═══ EL CENSO OFFLINE — el mismo predicado de la 125.ª y la 126.ª ════════ */
const esSemantica = (c) => !/^et[_-]/.test(c) && !/^(wp|has|is|clearfix)/.test(c) && c.length > 2;

function marcadoresDe(html) {
  const cuerpo = html.slice(html.indexOf("<body"));
  const out = new Set();
  for (const m of cuerpo.matchAll(/class\s*=\s*["']([^"']*)["']/gi)) {
    const clases = m[1].split(/\s+/).filter(Boolean);
    if (!clases.some((c) => /^et_pb_(section|row|module)$/.test(c))) continue;
    if (clases.some((c) => /_tb_(header|footer)/.test(c))) continue;
    for (const c of clases) if (esSemantica(c)) out.add(c);
  }
  return out;
}

function censo(docs) {
  const cuenta = new Map();
  const porDoc = {};
  for (const d of docs) {
    const ms = marcadoresDe(readFileSync(join(CORPUS, d.doc), "utf8"));
    porDoc[d.etiqueta] = [...ms].sort();
    for (const m of ms) {
      if (!cuenta.has(m)) cuenta.set(m, new Set());
      cuenta.get(m).add(d.etiqueta);
    }
  }
  const compartidos = [...cuenta].filter(([, s]) => s.size >= 2).sort((a, b) => b[1].size - a[1].size);
  const singleton = [...cuenta].filter(([, s]) => s.size === 1);
  return { cuenta, porDoc, compartidos, singleton };
}

const DOCS_FAMILIA = [
  { doc: `${ANCLA}.html`, etiqueta: ANCLA },
  ...resueltos.filter((r) => r.fichero).map((r) => ({ doc: r.fichero, etiqueta: r.doc })),
];
const DOCS_LOTE = [
  { doc: "monitor-calidad-aire.html", etiqueta: "PRODUCTO" },
  { doc: "accesorios.html", etiqueta: "CATALOGO" },
  { doc: "software-de-medicion-calidad-del-aire.html", etiqueta: "SOFTWARE" },
  { doc: "kunak-api.html", etiqueta: "SOFTWARE-corta" },
];

const cFam = censo(DOCS_FAMILIA);
const cLote = censo(DOCS_LOTE);

/* ── ¿REPRODUCEN? Se compara contra el número de ayer, con su instrumento ── */
const AYER_FAMILIA = { total: 21, compartidos: 18, singleton: 3, instrumento: "OFFLINE (regex sobre el HTML) — 126.ª" };
const AYER_LOTE = { total: 18, compartidos: 7, singleton: 11, instrumento: "NAVEGADOR con filtro CON CAJA — 125.ª" };

const repFam = cFam.cuenta.size === AYER_FAMILIA.total
  && cFam.compartidos.length === AYER_FAMILIA.compartidos
  && cFam.singleton.length === AYER_FAMILIA.singleton;
ctl(repFam, "REPRODUCE el censo de la familia PRODUCTO (mismo instrumento: OFFLINE)",
  `hoy ${cFam.cuenta.size} · ${cFam.compartidos.length} · ${cFam.singleton.length}   ayer ${AYER_FAMILIA.total} · ${AYER_FAMILIA.compartidos} · ${AYER_FAMILIA.singleton}`);

/* El lote NO se compara al par: el instrumento de ayer era otro. Lo que se
   exige es que el censo offline del lote DISCRIMINE y que se publiquen los dos
   números con su criterio — nunca uno solo (§*dos lecturas pueden dar el mismo
   cardinal contando unidades distintas*). */
const loteReproduce = cLote.cuenta.size === AYER_LOTE.total && cLote.compartidos.length === AYER_LOTE.compartidos;
ctl(cLote.compartidos.length > 0 && cLote.singleton.length > 0,
  "el censo OFFLINE del lote DISCRIMINA (ni cero compartidos ni pleno)",
  `hoy(offline) ${cLote.cuenta.size} · ${cLote.compartidos.length} · ${cLote.singleton.length}   ayer(navegador+caja) ${AYER_LOTE.total} · ${AYER_LOTE.compartidos} · ${AYER_LOTE.singleton}   ¿al par? ${loteReproduce ? "SI" : "NO — criterio de recuento distinto, no dato"}`);

/* ═══ LOS 46: intersección y SIN ESCRIBIR ════════════════════════════════ */
const v125 = JSON.parse(readFileSync(VARIANZA125, "utf8"));
const pares = v125.varianza ?? [];
const sinVarianza = pares.filter((p) => p.firmasDistintas === 1);
const conVarianza = pares.filter((p) => p.firmasDistintas > 1);

ctl(pares.length === 52 && sinVarianza.length === 46 && conVarianza.length === 6,
  "REPRODUCE el reparto de la 125.ª leído de su congelada (52 = 6 + 46)",
  `pares ${pares.length} · CAMPO ${conVarianza.length} · SIN VARIANZA ${sinVarianza.length}`);

/* ¿Cuántos de los 46 tienen su marcador también en la familia? Es el TECHO. */
const marcFamilia = new Set(cFam.compartidos.map(([m]) => m));
const alcanzables = sinVarianza.filter((p) => marcFamilia.has(p.marcador));
const fueraDeAlcance = sinVarianza.filter((p) => !marcFamilia.has(p.marcador));
ctl(alcanzables.length > 0,
  "HAY TECHO: pares de los 46 cuyo marcador está en >=2 documentos de la familia",
  `alcanzables ${alcanzables.length} de 46 · fuera de alcance ${fueraDeAlcance.length}`);

/* SIN ESCRIBIR — el único valor observado es el inicial de la propiedad (0).
   §*el test A supone que hay algo escrito*: para el modelo pesa lo mismo que
   SIN PROBAR (no se cablea) pero NO es la misma afirmación, y cambia lo que se
   puede predecir: un eje sin declaración no tiene cascada a la que preguntar. */
const soloCero = (p) => Object.values(p.porDoc).every((vals) => vals.every((x) => x === 0));
const sinEscribir = sinVarianza.filter(soloCero);
const conValor = sinVarianza.filter((p) => !soloCero(p));
ctl(sinEscribir.length > 0 && conValor.length > 0,
  "el corte SIN ESCRIBIR / con valor DISCRIMINA (ni cero ni pleno)",
  `SIN ESCRIBIR ${sinEscribir.length} · con valor no-inicial ${conValor.length} · suma ${sinEscribir.length + conValor.length} de 46`);

/* ═══ RÉGIMEN — los DOS marcadores del <body>, y la combinación se NOMBRA ══ */
/* §*se comprueban los DOS marcadores y se nombra la combinación, incluida la
   vacía*. Y la señal de `-T` no es la PRESENCIA de secciones `…_tb_body` sino
   su INVARIANTE: el constructor numera cada una una vez, así que
   ocurrencias == distintos. Una plantilla que copia la clase repite el mismo
   literal (2026-08-26). */
function regimen(html) {
  const bodyTag = html.match(/<body\b[^>]*>/i)?.[0] ?? "";
  const clasesBody = (bodyTag.match(/class\s*=\s*["']([^"']*)["']/i)?.[1] ?? "").split(/\s+/).filter(Boolean);
  const B = clasesBody.includes("et_pb_pagebuilder_layout");
  const T = clasesBody.includes("et-tb-has-body");
  const occ = [...html.matchAll(/et_pb_section_\d+_tb_body/g)].map((m) => m[0]);
  const dis = new Set(occ).size;
  return {
    marcadorB: B, marcadorT: T,
    casillero: `${B ? "B" : "-"}${T ? "T" : "-"}`,
    seccionesTbBody: { ocurrencias: occ.length, distintos: dis },
    invarianteNumerado: occ.length === 0 ? "no-aplica" : occ.length === 1 ? "INDETERMINADO (n=1, degenerado)" : occ.length === dis ? "numeradas (constructor)" : "REPETIDAS (clase copiada a mano)",
    clasesBody: clasesBody.slice(0, 12),
  };
}
const regimenes = {};
for (const d of DOCS_FAMILIA) regimenes[d.etiqueta] = regimen(readFileSync(join(CORPUS, d.doc), "utf8"));
const todosB = Object.values(regimenes).every((r) => r.casillero.startsWith("B"));
ctl(todosB,
  "PRECONDICIÓN DE LECTURA: los 3 documentos de la familia son régimen BUILDER (`B-`/`BT`) — si no, el test se INVIERTE",
  Object.entries(regimenes).map(([k, r]) => `${k}=${r.casillero}`).join(" · "));

/* ═══ INFORME ════════════════════════════════════════════════════════════ */
const L = [];
const say = (s = "") => { L.push(s); console.log(s); };

say("=== CONTROLES ===");
for (const c of controles) say(`  ${c.ok ? "OK " : "❌ "} ${c.nombre}\n      ${c.detalle}`);
say();

say("=== 1 · LAS CIFRAS DE AYER, DERIVADAS HOY (§regla 9, también con las propias) ===");
say(`  familia PRODUCTO  (offline, 3 docs)   hoy ${cFam.cuenta.size} · ${cFam.compartidos.length} en >=2 · ${cFam.singleton.length} singleton`);
say(`                                        ayer ${AYER_FAMILIA.total} · ${AYER_FAMILIA.compartidos} · ${AYER_FAMILIA.singleton}   ⇒ ${repFam ? "REPRODUCE" : "NO REPRODUCE"}`);
say(`  lote 4 arquetipos (offline, 4 docs)   hoy ${cLote.cuenta.size} · ${cLote.compartidos.length} en >=2 · ${cLote.singleton.length} singleton`);
say(`                    (navegador+caja)    ayer ${AYER_LOTE.total} · ${AYER_LOTE.compartidos} · ${AYER_LOTE.singleton}   ⇒ ${loteReproduce ? "al par" : "DISTINTO — y es de CRITERIO DE RECUENTO, no del dato"}`);
say(`  ⚠ los dos censos del lote son CIERTOS y cuentan cosas distintas: el de ayer exige CAJA (w>0 y h>0),`);
say(`    el de hoy lee el HTML. Se publican los dos con su criterio; ninguno corrige al otro.`);
say();

say("=== 2 · DOMINIO DE LA FAMILIA PRODUCTO ===");
say(`  documentos: ${DOCS_FAMILIA.map((d) => d.etiqueta).join(" · ")}`);
for (const [m, s] of cFam.compartidos) say(`    ${s.size} doc(s)  ${m}`);
say(`  singleton (${cFam.singleton.length}): ${cFam.singleton.map(([m]) => m).join(" · ") || "(ninguno)"}`);
say();

say("=== 3 · EL TECHO — cuántos de los 46 pueden siquiera MOVERSE ===");
say(`  alcanzables (su marcador está en >=2 docs de la familia): ${alcanzables.length} de 46`);
say(`  fuera de alcance:                                          ${fueraDeAlcance.length} de 46`);
const porMarc = new Map();
for (const p of sinVarianza) {
  const k = p.marcador;
  if (!porMarc.has(k)) porMarc.set(k, { total: 0, alcanzable: marcFamilia.has(k), sinEscribir: 0 });
  const e = porMarc.get(k);
  e.total++;
  if (soloCero(p)) e.sinEscribir++;
}
for (const [m, e] of porMarc) say(`    ${m.padEnd(20)} ${String(e.total).padStart(2)} pares · ${e.alcanzable ? "ALCANZABLE" : "fuera"} · ${e.sinEscribir} SIN ESCRIBIR`);
say();

say("=== 4 · LOS 46, PARTIDOS POR LA PREMISA CALLADA DEL TEST A ===");
say(`  SIN ESCRIBIR (único valor observado = 0, el inicial):  ${sinEscribir.length} de 46`);
say(`  con valor no-inicial y sin varianza:                   ${conValor.length} de 46`);
for (const p of conValor) say(`    · ${p.marcador} @${p.ancho} ${p.eje} → ${JSON.stringify(p.porDoc)}`);
say();

say("=== 5 · RÉGIMEN (precondición: en `B-` la varianza la escribió el editor; en `-T`/`--` NO existe ese editor) ===");
for (const [k, r] of Object.entries(regimenes))
  say(`  ${k.padEnd(26)} casillero ${r.casillero}  ·  secciones _tb_body ${r.seccionesTbBody.ocurrencias} occ / ${r.seccionesTbBody.distintos} dis  ·  ${r.invarianteNumerado}`);
say();

say("=== VEREDICTO DEL PASO 0 ===");
say(`  · las cifras de la familia REPRODUCEN: ${repFam ? "SÍ (21 · 18 · 3)" : "NO"}`);
say(`  · el lote NO se cruza al par y no debe: dos criterios de recuento, los dos publicados`);
say(`  · techo de la tanda: ${alcanzables.length} de los 46 pares son alcanzables por el dominio nuevo`);
say(`  · de los 46, ${sinEscribir.length} son SIN ESCRIBIR — sin declaración no hay cascada a la que preguntar`);
say(`  · régimen: ${todosB ? "los 3 son BUILDER, la lectura del test NO se invierte" : "⚠ NO todos son builder — la lectura se invierte en los que no"}`);

const salida = {
  fecha: new Date().toISOString().slice(0, 10), tanda: 127, escalon: "PASO 0",
  pregunta: "¿reproducen las cifras de ayer, cuál es el techo de la tanda, y qué régimen tienen los documentos?",
  alcance: { docsFamilia: DOCS_FAMILIA.map((d) => d.doc), docsLote: DOCS_LOTE.map((d) => d.doc), modo: "OFFLINE (sin navegador, sin red)" },
  controles,
  reproduccion: {
    familia: { hoy: { total: cFam.cuenta.size, compartidos: cFam.compartidos.length, singleton: cFam.singleton.length }, ayer: AYER_FAMILIA, reproduce: repFam },
    lote: { hoyOffline: { total: cLote.cuenta.size, compartidos: cLote.compartidos.length, singleton: cLote.singleton.length }, ayer: AYER_LOTE, alPar: loteReproduce, nota: "criterios de recuento distintos (caja vs HTML): los dos ciertos, ninguno corrige al otro" },
  },
  censoFamilia: { porDoc: cFam.porDoc, compartidos: cFam.compartidos.map(([m, s]) => ({ marcador: m, docs: [...s] })), singleton: cFam.singleton.map(([m]) => m) },
  censoLoteOffline: { compartidos: cLote.compartidos.map(([m, s]) => ({ marcador: m, docs: [...s] })), singleton: cLote.singleton.map(([m]) => m) },
  losCuarentaYSeis: {
    total: sinVarianza.length,
    alcanzables: alcanzables.length,
    fueraDeAlcance: fueraDeAlcance.length,
    sinEscribir: sinEscribir.length,
    conValor: conValor.length,
    detalleConValor: conValor.map((p) => ({ marcador: p.marcador, ancho: p.ancho, eje: p.eje, porDoc: p.porDoc })),
    porMarcador: [...porMarc].map(([m, e]) => ({ marcador: m, pares: e.total, alcanzable: e.alcanzable, sinEscribir: e.sinEscribir })),
  },
  regimenes,
  noContesta: [
    "NO mide varianza en la familia: eso es el ESCALON 1",
    "NO dice si un eje es CAMPO o PLANTILLA — sólo cuántos pueden llegar a tener veredicto",
  ],
};

const base = join(DERIV, process.env.SALIDA || "paso0-dominio-127");
for (const [ruta, texto] of [[`${base}.json`, JSON.stringify(salida, null, 1)], [`${base}.log`, L.join("\n") + "\n"]]) {
  if (existsSync(ruta) && readFileSync(ruta, "utf8") !== texto && !process.env.PISAR) {
    console.error(`❌ ${ruta} existe y DIFIERE — no se pisa (§regla 5). PISAR=1 para forzar.`);
    process.exit(1);
  }
  writeFileSync(ruta, texto);
}
const fallos = controles.filter((c) => !c.ok);
console.log(`\n✓ evaluados ${DOCS_FAMILIA.length}/${DOCS_FAMILIA.length} documentos de la familia · ${DOCS_LOTE.length}/${DOCS_LOTE.length} del lote · controles ${controles.length - fallos.length}/${controles.length}`);
console.log(`→ ${base}.json  ·  ${base}.log`);
if (fallos.length) { console.error(`❌ ${fallos.length} control(es) en rojo`); process.exit(1); }
