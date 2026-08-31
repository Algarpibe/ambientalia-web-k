// 129.ª · PASO 0 — LAS DOS PREGUNTAS, CADA UNA EN SUS DOS DIRECCIONES.
//
// El encargo afirma dos cosas y las dos se DERIVAN (§regla 9), porque un
// número recordado y uno derivado se escriben igual y no valen lo mismo:
//
//   P1 · «el eje `módulos` está a `·` en las 4 rutas del lote F3-5».
//        Y SU DIRECCIÓN CONTRARIA (§*una comprobación retroactiva se enmarca en
//        las DOS direcciones*): ¿está SOBRE-GENERALIZADO? ¿existe ya una sonda
//        del repo que compare módulos de DOS LADOS y alcance alguna de las 4?
//        Si la hay, la tanda es otra y mucho más barata — CORTE DECLARADO.
//
//   P2 · el eje `comportamiento` tiene DOS LECTURAS conviviendo: la matriz de
//        `COBERTURA-MEDICION.md` marca `O` en las 4 y `CLAUDE.md` lo tiene
//        fichado como `0/31`. Las dos no pueden ser verdad, y la salida no es
//        conciliarlas con una nota al pie: es BORRAR una (§*dos lecturas del
//        mismo conjunto se resuelven eliminando una*).
//
// CÓMO SE CONTESTA P1b, Y POR QUÉ NO POR `grep` DE LA PALABRA «modulo»:
// un `grep` contesta *«¿el fichero nombra módulos?»* y da 36 de 151 sondas —
// entre ellas `cobertura.mjs`, que sólo los TABULA, y `media-canales.mjs`, que
// habla de otra cosa. La pregunta es *«¿QUÉ SONDA ACREDITA el eje `modulos` y
// SOBRE QUÉ RUTAS?»*, y de eso hay un juez en el repo: `cobertura.mjs` es quien
// decide qué acredita cada eje, y su congelada nombra sonda Y fichero por celda.
// Así que el veredicto se lee de la CONGELADA, no de la prosa del `.md` ni de un
// barrido de literales (§*el veredicto lo da la salida servida*).
//
// ⚠ Y LA CONGELADA SE RESUELVE POR `mtime`, NUNCA POR NOMBRE (§regla 5): el
// canónico `cobertura.json` es del 2026-08-17 y hay corridas hasta el 08-30.
// Leer el nombre obvio daría la matriz de hace dos semanas — «la primera foto»,
// que con el tiempo es la más vieja del montón. Se descartan los artefactos de
// la §regla 7, y se DICE EN VOZ ALTA qué fichero se resolvió y con qué fecha.
//
// LOS CONTROLES, porque un cero sin control no vale (§regla 8):
//
//   C1 · el resolutor por `mtime` NO elige el canónico ni un artefacto.
//   C2 · el eje `modulos` NO está a cero en el repo entero — si lo estuviera,
//        el `·` de las 4 sería del INSTRUMENTO y no del objeto (§sondas 4: un
//        selector que no casa con nada no es un cero).
//   C3 · las 4 rutas del lote EXISTEN en la matriz — si no casaran, su `·`
//        sería de la llave y no del dato (§regla 29, la mitad que falta).
//   C4 · el barrido por literal de P1b tiene que hallar ALGUNA sonda: un cero
//        del barrido sería del filtro.
//   C5 · la lectura `0/31` de P2 tiene que aparecer en ALGÚN sitio del repo —
//        si no aparece, no hay dos lecturas que dirimir y P2 no existe.
//
// LO QUE NO CONTESTA: no mide un solo píxel, no abre navegador, no toca red,
// clon, Postgres ni construye. Es OFFLINE y sobre artefactos ya congelados.

import { readFileSync, existsSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const M = join(RAIZ, "scripts", "qa", "medidas");
const QA = join(RAIZ, "scripts", "qa");
const DOCS = join(RAIZ, "docs");

/* Artefactos de la §regla 7: un fichero que NO es una medida del sitio no
 * acredita nada, y el más reciente de una familia puede ser justo el sabotaje
 * que acaba de correr el negativo. */
const ARTEFACTO = /-neg-|SABOTAJE|SONDA-|CONTAMINADA|OBSOLETA|INTERRUMPIDA/;

/* El lote de F3-5, DERIVADO de `PLAN-FASE-3.md` §F3-5 y no escrito de memoria:
 * las 4 rutas que siguen sirviéndose de `src/lib/` menos HOME, que el encargo
 * deja fuera por alcance. */
const LOTE = [
  ["/monitor-calidad-aire", "PRODUCTO"],
  ["/accesorios", "CATÁLOGO"],
  ["/software-de-medicion-calidad-del-aire", "SOFTWARE"],
  ["/kunak-api", "SOFTWARE-corta"],
];

const salida = [];
const di = (s = "") => {
  salida.push(s);
  console.log(s);
};

const fallos = [];
const control = (id, ok, detalle) => {
  di(`   ${ok ? "✓" : "✗"} ${id} · ${detalle}`);
  if (!ok) fallos.push(id);
};

/* ── el resolutor por mtime, con su descarte de artefactos ──────────────── */
function resuelve(prefijo) {
  const cand = readdirSync(M)
    .filter((x) => x.startsWith(prefijo) && x.endsWith(".json") && !ARTEFACTO.test(x))
    .map((x) => ({ x, mt: statSync(join(M, x)).mtimeMs }))
    .sort((a, b) => b.mt - a.mt);
  return cand[0] ?? null;
}

di("═".repeat(78));
di("129.ª · PASO 0 — las dos preguntas, en las dos direcciones");
di("═".repeat(78));
di("");

/* ═══ P1a · ¿está `módulos` a `·` en las 4? ══════════════════════════════ */

di("── P1a · el eje `módulos` en las 4 rutas del lote ──────────────────────");
const elegida = resuelve("cobertura");
if (!elegida) {
  console.error("PRECONDICIÓN: no hay congelada de cobertura. La corrida no vale.");
  process.exit(2);
}
const fecha = (t) => new Date(t).toISOString().slice(0, 16).replace("T", " ");
di(`   congelada resuelta por mtime: ${elegida.x}  (mtime ${fecha(elegida.mt)})`);

const cob = JSON.parse(readFileSync(join(M, elegida.x), "utf8"));
di(`   meta: fecha=${cob.meta?.fecha} · rutas=${cob.meta?.rutas} · sabotaje=${cob.meta?.sabotaje}`);
di("");

const matriz = cob.matriz || {};
const EJES_MIRADOS = ["docH", "base", "secciones", "filas", "modulos", "offsets", "anchos", "enlaces", "comport"];

const p1a = [];
di("   | ruta | arquetipo | módulos | offsets | comport |");
di("   |---|---|---|---|---|");
for (const [ruta, arq] of LOTE) {
  const fila = matriz[ruta];
  const cel = (e) => {
    const c = fila?.[e];
    return !c ? "·" : c.nivel === "O" ? `O (${c.sonda ?? "?"})` : c.nivel;
  };
  p1a.push({
    ruta,
    arquetipo: arq,
    enMatriz: !!fila,
    modulos: fila?.modulos ?? null,
    offsets: fila?.offsets ?? null,
    comport: fila?.comport ?? null,
  });
  di(`   | \`${ruta}\` | ${arq} | ${cel("modulos")} | ${cel("offsets")} | ${cel("comport")} |`);
}
di("");

const modulosAPunto = p1a.filter((r) => r.enMatriz && r.modulos === null).length;
di(`   → \`módulos\` a \`·\`: ${modulosAPunto} de ${LOTE.length} rutas del lote`);
di("");

/* ═══ Controles del bloque P1a ═══════════════════════════════════════════ */
di("── controles de P1a ────────────────────────────────────────────────────");
control(
  "C1 · resolutor",
  elegida.x !== "cobertura.json" && !ARTEFACTO.test(elegida.x),
  `eligió \`${elegida.x}\`, ni el canónico (2026-08-17) ni un artefacto`,
);

const modulosEnRepo = Object.values(matriz).filter((f) => f?.modulos?.nivel === "O").length;
const sondasModulos = [...new Set(Object.values(matriz).map((f) => f?.modulos?.sonda).filter(Boolean))];
control(
  "C2 · el eje no está muerto",
  modulosEnRepo > 0,
  `\`modulos\` acreditado en ${modulosEnRepo} de ${Object.keys(matriz).length} rutas del repo · sondas: ${sondasModulos.join(" · ") || "NINGUNA"}`,
);
control(
  "C3 · las 4 casan",
  p1a.every((r) => r.enMatriz),
  `${p1a.filter((r) => r.enMatriz).length} de ${LOTE.length} rutas del lote presentes en la matriz`,
);
di("");

/* ═══ P1b · LA DIRECCIÓN CONTRARIA ═══════════════════════════════════════ */

di("── P1b · ¿está sobre-generalizado? ¿hay ya comparador de módulos? ──────");
di("");
di("   (i) por la CONGELADA — qué sondas acreditan `modulos` y sobre qué rutas");

/* Qué rutas acredita cada sonda en el eje `modulos`, nombrando los elementos:
 * una pregunta de membresía se contesta NOMBRANDO, no contando. */
const porSonda = {};
for (const [ruta, fila] of Object.entries(matriz)) {
  const c = fila?.modulos;
  if (c?.nivel !== "O") continue;
  (porSonda[c.sonda] ??= []).push(ruta);
}
for (const [s, rutas] of Object.entries(porSonda).sort((a, b) => b[1].length - a[1].length)) {
  const tocaLote = rutas.filter((r) => LOTE.some(([l]) => l === r));
  di(`     · ${s}: ${rutas.length} rutas — del lote: ${tocaLote.length ? tocaLote.join(", ") : "NINGUNA"}`);
}
if (!Object.keys(porSonda).length) di("     (ninguna sonda acredita `modulos` en ninguna ruta)");
di("");

/* (ii) por el BARRIDO de `scripts/qa/`: una sonda puede COMPARAR módulos y no
 * estar acreditada todavía. El predicado tiene TRES condiciones y se publica
 * el reparto de cada una, no sólo la conjunción — un cero de la conjunción no
 * dice cuál de las tres lo produjo.
 *
 * ⚠⚠ SE PUBLICAN LOS DOS PREDICADOS, EL LAXO Y EL ENDURECIDO, Y AL LADO —
 * porque el laxo produjo una REFUTACIÓN CÓMODA (§regla 40: si se refuta a la
 * primera y por varias candidatas a la vez, lo primero que se mira no es el
 * dato sino con qué se alimentó al refutador). Su `\bmodulos?\b` casa el
 * NOMBRE DE UN EJE en una tabla, así que metía `cobertura.mjs` —que sólo
 * TABULA— y `d4-pie.mjs` —que mide el pie—. El endurecido exige que el módulo
 * sea la UNIDAD SELECCIONADA en el DOM, no una palabra del fichero.
 *
 * Los dos se conservan porque la diferencia ES el hallazgo: 3 candidatas
 * contra 1, y la que sobrevive es la que la congelada ya nombraba. */
di("   (ii) por el BARRIDO de `scripts/qa/` — tres condiciones, cada una con su n");

const sondas = readdirSync(QA).filter((x) => x.endsWith(".mjs") && !x.includes(".neg."));
const RE_ORIGINAL = /kunakair\.com|ORIGINAL|originalUrl|\borig\b/i;
/* LAXO: la palabra aparece en el fichero. ENDURECIDO: el módulo se SELECCIONA
 * en el DOM — el marcador que Divi emite (`et_pb_module`) o el que el clon
 * emite para las sondas (`data-modulo`), dentro de un selector. */
const RE_MODULO_LAXO = /et_pb_module|data-modulo|\bmodulos?\b/i;
const RE_MODULO_DURO = /(querySelector\w*|__qa?|\$\$?)\s*\([^)]*(et_pb_module|data-modulo)|["'`][^"'`]*(et_pb_module|\[data-modulo)/;
const barrido = [];
for (const f of sondas) {
  const src = readFileSync(join(QA, f), "utf8");
  /* Se descuentan los comentarios: un barrido por literal casa dentro de un
   * `//` que DOCUMENTA el defecto, y atribuirlo al código es §regla 9, el
   * falso positivo del comentario. */
  const codigo = src
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .split("\n")
    .map((l) => l.replace(/(^|[^:])\/\/.*$/, "$1"))
    .join("\n");
  const dosLados = RE_ORIGINAL.test(codigo);
  const alcanza = LOTE.filter(([r]) => codigo.includes(r)).map(([r]) => r);
  barrido.push({ sonda: f, dosLados, laxo: RE_MODULO_LAXO.test(codigo), duro: RE_MODULO_DURO.test(codigo), alcanza });
}
const cA = barrido.filter((b) => b.dosLados).length;
const cBl = barrido.filter((b) => b.laxo).length;
const cBd = barrido.filter((b) => b.duro).length;
const cC = barrido.filter((b) => b.alcanza.length).length;
const conjLaxo = barrido.filter((b) => b.dosLados && b.laxo && b.alcanza.length);
const conjDuro = barrido.filter((b) => b.dosLados && b.duro && b.alcanza.length);
di(`     A  · carga el ORIGINAL (dos lados) ............... ${cA} de ${sondas.length}`);
di(`     Bl · NOMBRA el módulo (laxo) ..................... ${cBl} de ${sondas.length}`);
di(`     Bd · SELECCIONA el módulo en el DOM (endurecido) . ${cBd} de ${sondas.length}`);
di(`     C  · alcanza ≥1 ruta del lote ................... ${cC} de ${sondas.length}`);
di("");
di(`     A∧Bl∧C · candidatas (LAXO) ...... ${conjLaxo.length} de ${sondas.length}`);
for (const b of conjLaxo) di(`         → ${b.sonda} — alcanza ${b.alcanza.length}/4`);
di(`     A∧Bd∧C · candidatas (ENDURECIDO)  ${conjDuro.length} de ${sondas.length}`);
for (const b of conjDuro) di(`         → ${b.sonda} — alcanza ${b.alcanza.length}/4`);
di("");

di("── controles de P1b ────────────────────────────────────────────────────");
control("C4 · el barrido no está muerto", cA > 0 && cBd > 0 && cC > 0, `A=${cA} · Bd=${cBd} · C=${cC}, ninguna condición a cero`);
control(
  "C4b · el barrido no es un pleno",
  cA < sondas.length && cBd < sondas.length && cC < sondas.length,
  `A=${cA}/${sondas.length} · Bd=${cBd}/${sondas.length} · C=${cC}/${sondas.length}, ninguna casa en todas`,
);
control(
  "C4c · el endurecido SEPARA",
  conjDuro.length < conjLaxo.length,
  `laxo ${conjLaxo.length} → duro ${conjDuro.length}: descarta ${conjLaxo.filter((b) => !conjDuro.includes(b)).map((b) => b.sonda).join(", ") || "nada"}`,
);
di("");

/* ═══ P1c · LA TERCERA SALIDA — el comparador existe y su EJE está CIEGO ══
 *
 * Ni «no existe» ni «existe y mide». `cobertura.mjs` acredita `productos-cmp`
 * en `filas` y NO en `modulos`, con la razón escrita. Eso no se lee del
 * comentario (§regla 3, *documentado no es conectado*): se lee de la CONGELADA,
 * que publica el eje excluido con su cardinal por fila (§regla 14). */
di("── P1c · la tercera salida: ¿el comparador existe con el eje CIEGO? ─────");
const CMP = "productos-cmp";
const cong = {};
for (const a of [1440, 390]) {
  const r = resuelve(`${CMP}-${a}`);
  if (!r) continue;
  cong[a] = JSON.parse(readFileSync(join(M, r.x), "utf8"));
  di(`   ${r.x} (mtime ${fecha(r.mt)}) · acredita=${cong[a].meta?.acredita}`);
}
const c1440 = cong[1440];
let ejeCiego = null;
if (c1440) {
  const exc = c1440.resumen?.ejesExcluidos ?? {};
  ejeCiego = exc.modulos ?? null;
  di(`   resumen: pares=${c1440.resumen?.pares} · ejesComparados=${c1440.resumen?.ejesComparados} · distintos=${c1440.resumen?.distintos}`);
  di(`   ejesExcluidos.modulos: ${ejeCiego ?? "(ninguno)"}`);
  di("");
  di("   el cardinal del eje ciego, POR FILA y con sus dos lados (§regla 14):");
  di("   | ruta | filas orig→clon | módulos orig (por fila) | lo que el clon expone |");
  di("   |---|---|---|---|");
  for (const i of c1440.informe ?? []) {
    const pf = i.modulosSinComparar?.porFila ?? [];
    const o = pf.map((x) => x.orig).join("·");
    const c = pf.map((x) => x.clonHijosDirectos).join("·");
    di(`   | \`${i.ruta}\` | ${i.filas?.orig}→${i.filas?.clon} | ${o} (Σ${pf.reduce((s, x) => s + x.orig, 0)}) | ${c} (Σ${pf.reduce((s, x) => s + x.clonHijosDirectos, 0)}) |`);
  }
}
/* Sus negativos: un `npm run …-neg` registrado no prueba que el fichero exista
 * (§regla 26), y el censo enumera el DISCO, así que un negativo ausente no sale
 * rojo — no sale. */
const negFichero = existsSync(join(QA, `${CMP}.neg.mjs`));
const negCongeladas = readdirSync(M).filter((x) => x.startsWith(`${CMP}-`) && /-neg-/.test(x));
di("");
di(`   negativo: fichero \`${CMP}.neg.mjs\` ${negFichero ? "EXISTE" : "AUSENTE"} · congeladas de negativo: ${negCongeladas.length} — ${negCongeladas.join(", ") || "ninguna"}`);
di("");

/* ═══ P2 · las dos lecturas del eje `comportamiento` ═════════════════════ */

di("── P2 · las dos lecturas de `comportamiento` ───────────────────────────");

const comportEnRepo = Object.values(matriz).filter((f) => f?.comport?.nivel === "O").length;
const recComport = (cob.recuento || []).find((r) => r.eje === "comport");
di(`   lectura A · la MATRIZ (congelada ${elegida.x}):`);
di(`     · \`comport\` = O en ${comportEnRepo} de ${Object.keys(matriz).length} rutas`);
if (recComport) di(`     · recuento propio de la sonda: O=${recComport.O} · c=${recComport.c} · nunca=${recComport.nunca} · sondas: ${(recComport.sondas || []).join(" · ")}`);
const comportLote = p1a.filter((r) => r.comport?.nivel === "O");
di(`     · de las 4 del lote: ${comportLote.length} con O — ${comportLote.map((r) => r.ruta).join(", ") || "ninguna"}`);
di("");

/* La lectura B se busca en el repo: un hecho negativo se comprueba contra el
 * archivo, no de memoria (§regla 8b). */
di(`   lectura B · el «0/31» — dónde vive HOY:`);
/* ⚠ `CLAUDE.md` vive en la RAÍZ, no en `docs/`. La v1 de este barrido las
 * resolvía las dos con `join(DOCS, rel)`, así que el fichero que se lee CADA
 * SESIÓN salía con 0 ocurrencias — §sondas 4 cometida sobre un `join`: un
 * camino que no resuelve no da error, da un CERO. Se declara la raíz de cada
 * documento en vez de derivarla de un prefijo, y un documento que no resuelva
 * cierra el código de salida. */
const docsBarridos = [
  [RAIZ, "CLAUDE.md"],
  [DOCS, "PENDIENTES-QA.md"],
  [DOCS, "research/COBERTURA-MEDICION.md"],
  [DOCS, "PLAN-FASE-3.md"],
  [DOCS, "PLAN-CLONADO.md"],
  [DOCS, "ESQUEMA-CMS.md"],
];
const RE_0DE31 = /0\s*\/\s*31/;
const sitios = [];
const noResueltos = [];
for (const [raiz, rel] of docsBarridos) {
  const p = join(raiz, rel);
  if (!existsSync(p)) {
    noResueltos.push(rel);
    continue;
  }
  const lineas = readFileSync(p, "utf8").split("\n");
  for (let i = 0; i < lineas.length; i++) {
    if (RE_0DE31.test(lineas[i])) sitios.push({ fichero: rel, linea: i + 1, texto: lineas[i].trim().slice(0, 150) });
  }
}
const porFichero = {};
for (const s of sitios) (porFichero[s.fichero] ??= []).push(s.linea);
for (const [f, ls] of Object.entries(porFichero)) di(`     · ${f}: ${ls.length} ocurrencias — líneas ${ls.slice(0, 12).join(", ")}${ls.length > 12 ? " …" : ""}`);
if (!sitios.length) di("     (ninguna ocurrencia)");
di("");

di("── controles de P2 ─────────────────────────────────────────────────────");
control(
  "C5 · el barrido RESUELVE sus documentos",
  noResueltos.length === 0,
  noResueltos.length ? `NO resuelven: ${noResueltos.join(", ")} — su cero sería del camino, no del texto` : `${docsBarridos.length} de ${docsBarridos.length} resueltos`,
);
control("C5b · hay dos lecturas que dirimir", sitios.length > 0, `${sitios.length} ocurrencias del «0/31» en ${Object.keys(porFichero).length} ficheros`);
control(
  "C5c · la matriz no está muerta en ese eje",
  comportEnRepo > 0,
  `\`comport\` acreditado en ${comportEnRepo} rutas — el O no es del instrumento`,
);
di("");

/* ═══ veredicto ══════════════════════════════════════════════════════════ */

di("═".repeat(78));
/* ⚠ EL VEREDICTO NO ES BINARIO, y forzarlo a serlo es lo que produjo el «SÍ
 * EXISTE» de la v1. El encargo contempla dos salidas —existe / no existe— y la
 * real es una TERCERA: el comparador está construido, adjudicado y alcanza las
 * 4 rutas, y su eje `modulos` está DECLARADO SIN COMPARAR porque le falta un
 * insumo del CLON, no porque le falte código. */
const acreditaModulos = Object.entries(porSonda).some(([, rs]) => rs.some((r) => LOTE.some(([l]) => l === r)));
const existeComparador = conjDuro.length > 0;
const veredicto = acreditaModulos
  ? "A · EXISTE Y MIDE — el eje ya está acreditado; la tanda sería correr y leer"
  : existeComparador && ejeCiego
    ? "B · EXISTE Y SU EJE ESTÁ CIEGO — construido y adjudicado, declara `modulos` SIN COMPARAR con su motivo y su cardinal"
    : "C · NO EXISTE — hay que construirlo, que es lo que el encargo supone";
di("VEREDICTO");
di("");
di(`  P1a · \`módulos\` a \`·\` en ${modulosAPunto} de ${LOTE.length} rutas del lote.`);
di(`  P1b · barrido: ${conjLaxo.length} candidatas con el predicado LAXO · ${conjDuro.length} con el ENDURECIDO.`);
di(`  P1c · ${veredicto}`);
di(`  P2  · matriz dice O en ${comportLote.length}/4 · el «0/31» vive en ${sitios.length} sitios de ${Object.keys(porFichero).length} ficheros.`);
di("");
di(`  controles: ${fallos.length === 0 ? "todos en verde" : `EN ROJO — ${fallos.join(", ")}`}`);
di("═".repeat(78));

const OUT = join(RAIZ, "docs", "research", "cola-larga", "derivaciones");
const nombre = process.env.NEG ? `paso0-129-neg-${process.env.NEG}` : "paso0-129";
writeFileSync(
  join(OUT, `${nombre}.json`),
  JSON.stringify(
    {
      meta: {
        tanda: "129.ª",
        fecha: new Date().toISOString().slice(0, 10),
        congeladaResuelta: { fichero: elegida.x, mtime: fecha(elegida.mt) },
        offline: true,
        noContesta: "no mide un píxel; no abre navegador; no toca red, clon, Postgres ni construye",
      },
      p1a: { lote: p1a, modulosAPunto, de: LOTE.length },
      p1b: {
        porCongelada: porSonda,
        barrido: { sondas: sondas.length, A: cA, Bl: cBl, Bd: cBd, C: cC, conjuncionLaxo: conjLaxo, conjuncionEndurecida: conjDuro },
      },
      p1c: {
        veredicto,
        acreditaModulos,
        existeComparador,
        comparador: CMP,
        ejeCiego,
        negativo: { fichero: negFichero, congeladasDeNegativo: negCongeladas },
        porRuta: (c1440?.informe ?? []).map((i) => ({
          ruta: i.ruta,
          filas: i.filas,
          modulosOrig: (i.modulosSinComparar?.porFila ?? []).reduce((s, x) => s + x.orig, 0),
          clonHijosDirectos: (i.modulosSinComparar?.porFila ?? []).reduce((s, x) => s + x.clonHijosDirectos, 0),
          porFila: i.modulosSinComparar?.porFila ?? [],
        })),
      },
      p2: {
        matrizO: comportEnRepo,
        recuento: recComport ?? null,
        loteConO: comportLote.map((r) => r.ruta),
        ocurrencias0de31: sitios,
        porFichero,
        documentosNoResueltos: noResueltos,
      },
      controles: { fallos, verde: fallos.length === 0 },
    },
    null,
    2,
  ) + "\n",
);
writeFileSync(join(OUT, `${nombre}.log`), salida.join("\n") + "\n");

process.exit(fallos.length ? 3 : 0);
