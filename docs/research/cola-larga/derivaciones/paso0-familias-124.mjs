// 124.ª · PASO 0 — ¿QUE PARTE DEL 87 % ES RITMO?
//
// Se contesta SIN NAVEGADOR, sobre la congelada de la 123.ª. Son tres preguntas
// del encargo y ninguna necesita medir nada nuevo:
//
//   1. de los 27 «al reves», cuantos son RITMO, cuantos CAJA y cuantos
//      TIPOGRAFIA — con su denominador POR FAMILIA, no en total;
//   2. de los ejes de ritmo, cuantos habria clasificado BIEN el test A;
//   3. la premisa callada: cuantos de los 31 tienen un solo valor observado y si
//      es el INICIAL de la propiedad.
//
// ⚠ LA FAMILIA SE DERIVA DEL NOMBRE DEL EJE, NO SE RECUERDA (§regla 9). Y el
// cero de CAJA y TIPOGRAFIA se publica CON SU MECANISMO: si sale 0 porque la
// 123.ª no las midio, eso es «no se miro», no «no hay» — §sondas 4, donde no
// encontrar nada y no mirar nada dan la misma salida.

import { readFileSync, writeFileSync } from "node:fs";

const J = JSON.parse(readFileSync("docs/research/cola-larga/derivaciones/tests-ab-123.json", "utf8"));

/* La familia de un eje se DERIVA de su nombre. `margin`/`padding` son ritmo;
 * `width`/`height`/`border*` serian caja; `fontSize`/`lineHeight` tipografia. */
const familiaDe = (eje) => {
  if (/^(margin|padding)(Top|Bottom|Left|Right)$/.test(eje)) return "ritmo";
  if (/^(width|height|maxWidth|minWidth|border)/.test(eje)) return "caja";
  if (/^(font|lineHeight|letterSpacing|textTransform)/.test(eje)) return "tipografia";
  return "SIN CLASIFICAR";
};

/* ── 1 · REPARTO POR FAMILIA, con el 2x2 dentro de cada una ────────────────── */
const FAMILIAS = ["ritmo", "caja", "tipografia", "SIN CLASIFICAR"];
const porFamilia = {};
for (const fam of FAMILIAS) porFamilia[fam] = { celdas: 0, sinEscribir: 0, "varia+seMueve": 0, "varia+noSeMueve": 0, "noVaria+seMueve": 0, "noVaria+noSeMueve": 0, ejes: new Set() };
for (const f of J.filas) {
  const fam = familiaDe(f.eje);
  const b = porFamilia[fam];
  b.celdas++;
  b.ejes.add(f.eje);
  if (!f.hayAlgoEscrito) b.sinEscribir++;
  else b[(f.varia ? "varia" : "noVaria") + "+" + (f.seMueve ? "seMueve" : "noSeMueve")]++;
}

/* ── 2 · ¿CUANTOS HABRIA CLASIFICADO BIEN EL TEST A? ───────────────────────────
 * El test A, aplicado SOLO y sobre los ejes ESCRITOS, dice:
 *   seMueve   ⇒ es un % del padre ⇒ PLANTILLA
 *   noSeMueve ⇒ px absolutos      ⇒ CAMPO
 * El test B (la regla general, sin restriccion de alcance) dice CAMPO en los 31.
 * Asi que «bien» = el test A tambien dijo CAMPO = noSeMueve. */
const escritos = J.filas.filter((f) => f.hayAlgoEscrito);
const acierta = escritos.filter((f) => !f.seMueve);
const falla = escritos.filter((f) => f.seMueve);

/* ── 3 · LA PREMISA CALLADA: ¿son 17 y 31 dos lecturas del MISMO dato? ────────
 * NO pueden serlo: el veredicto se asigna en cascada y `SIN ESCRIBIR` se evalua
 * ANTES que todo lo demas, asi que las dos clases son DISJUNTAS por
 * construccion. Se comprueba en vez de razonarse. */
const conUnSoloValor = J.filas.filter((f) => f.nDistintos === 1);
const unSoloValorYEsInicial = conUnSoloValor.filter((f) => f.valores1440[0] === 0);
const solapan = escritos.filter((f) => f.nDistintos === 1 && f.valores1440[0] === 0);

/* ── CONTROLES ────────────────────────────────────────────────────────────── */
const controles = [];
controles.push({
  nombre: "el reparto por familia SUMA el total de celdas",
  ok: FAMILIAS.reduce((a, f) => a + porFamilia[f].celdas, 0) === J.filas.length,
  visto: `${FAMILIAS.map((f) => `${f}=${porFamilia[f].celdas}`).join(" · ")} vs filas=${J.filas.length}`,
});
controles.push({
  nombre: "ningun eje queda SIN CLASIFICAR (el clasificador cubre el dominio)",
  ok: porFamilia["SIN CLASIFICAR"].celdas === 0,
  visto: `sin clasificar = ${porFamilia["SIN CLASIFICAR"].celdas}`,
});
/* ⚠ ESTE es el control que impide leer un cero como un dato. */
controles.push({
  nombre: "el 0 de CAJA/TIPOGRAFIA es POR CONSTRUCCION, no un hallazgo",
  ok: porFamilia.caja.celdas === 0 && porFamilia.tipografia.celdas === 0,
  visto: `la 123.ª declaro su alcance «${J.meta.alcance}» y midio ${[...porFamilia.ritmo.ejes].join(",")} — 0 ejes de caja y 0 de tipografia ENTRARON, asi que su 0 dice «no se miro», NO «no hay»`,
});
controles.push({
  nombre: "SIN ESCRIBIR y CAMPO son DISJUNTOS (no dos lecturas del mismo dato)",
  ok: solapan.length === 0,
  visto: `celdas escritas con un solo valor = 0: ${solapan.length} · SIN ESCRIBIR = ${conUnSoloValor.length}`,
});

const nulo = controles.some((c) => !c.ok);

/* ── SALIDA ───────────────────────────────────────────────────────────────── */
const salida = {
  meta: {
    tanda: "124.ª · PASO 0",
    fecha: new Date().toISOString().slice(0, 10),
    fuente: "docs/research/cola-larga/derivaciones/tests-ab-123.json (congelada, 48 celdas)",
    lado: "NINGUNO — no mide el original ni el clon: RECLASIFICA una congelada",
    contesta: [
      "que familia son los 27 «al reves», con denominador por familia",
      "cuantos ejes de ritmo habria clasificado BIEN el test A",
      "si el «87 % al reves» y la premisa callada son dos lecturas del mismo dato",
    ],
    noContesta: [
      "si el test A acierta POR NODO — la congelada agrega con `.some()` a nivel de CELDA y no guarda los nodos. Eso lo mide paso0-nodos-124",
      "la unidad DECLARADA (un `em` no se mueve con el ancho): haria falta la cascada",
    ],
  },
  controles,
  porFamilia: Object.fromEntries(Object.entries(porFamilia).map(([k, v]) => [k, { ...v, ejes: [...v.ejes] }])),
  testAsolo: {
    escritos: escritos.length,
    acierta: acierta.length,
    falla: falla.length,
    pctFalla: escritos.length ? +((falla.length / escritos.length) * 100).toFixed(1) : null,
  },
  premisaCallada: {
    celdasConUnSoloValor: conUnSoloValor.length,
    deEsasElValorEsElInicial: unSoloValorYEsInicial.length,
    solapanConLosEscritos: solapan.length,
  },
  /* ⚠⚠ EL DIAGNOSTICO, y es el que decide la tanda: `seMueve` se calcula con
   * `.some()` SOBRE TODOS LOS NODOS DE LA CELDA, asi que basta UN nodo que se
   * mueva para que la celda entera salga «seMueve». Una celda que mezcle
   * defaults del constructor (responsive, se mueven) con valores del editor (px,
   * no se mueven) sale «varia+seMueve» = «al reves» AUNQUE el test A haya
   * clasificado BIEN cada uno de sus nodos. Es §la causa comun: el NIVEL al que
   * se mide, con el contenedor puesto en la CELDA. */
  diagnosticoDeNivel: {
    unidadDeLa123: "celda = documento × tipo × eje",
    comoSeAgrega: "seMueve = v1440.some((x,k) => x !== v390[k]) — basta UN nodo",
    porQueImporta: "una celda con defaults Y valores de editor sale «al reves» aunque el test A acierte en cada nodo",
    /* La sospecha no es una corazonada: se lee en los VALORES de la congelada. */
    celdasQueMezclanDefaultConEditor: escritos
      .filter((f) => f.seMueve && f.varia)
      .map((f) => ({
        celda: `${f.arquetipo} ${f.tipo} ${f.eje}`,
        valores: f.valores1440,
        /* defaults publicados en CLAUDE.md, resueltos con la rejilla de LayoutUnit */
        contieneDefaultConocido: f.valores1440.some((v) => [57.5938, 28.7969, 14.3906, 34.0469, 31.6719, 25.0625].includes(v)),
      })),
  },
  /* PRE-REGISTRO — se escribe ANTES de medir por nodo (§regla 8b). */
  preRegistro: {
    hipotesis: "el «87 % al reves» es un artefacto de la UNIDAD, no una propiedad del test A",
    prediccion: [
      "P1 · en las celdas que mezclan, los nodos que SE MUEVEN son los que llevan un valor DEFAULT, y los que NO se mueven son los que llevan un valor del editor",
      "P2 · medido POR NODO, el test A acierta en la GRAN MAYORIA de los pares (nodo,eje) escritos — muy por encima del 13 % que da la lectura por celda",
      "P3 · debe existir al menos UNA celda separadora: «varia+seMueve» a nivel de celda y con 0 nodos mal clasificados",
    ],
    comoSeRefuta: [
      "si los nodos con valor default NO se mueven, o los nodos con valor de editor SI se mueven, P1 es falsa",
      "si al medir por nodo el acierto sigue por debajo del 50 %, P2 es falsa y el alcance del test A queda REFUTADO de verdad",
    ],
  },
  veredicto: nulo ? "NULA — control en rojo" : "valida",
};

writeFileSync("docs/research/cola-larga/derivaciones/paso0-familias-124.json", JSON.stringify(salida, null, 2) + "\n", "utf8");

console.log("=== CONTROLES ===");
for (const c of controles) console.log(`  ${c.ok ? "OK " : "RED"} ${c.nombre}\n      ${c.visto}`);
console.log("");
console.log("=== 1 · REPARTO POR FAMILIA (denominador por familia, no en total) ===");
for (const fam of FAMILIAS) {
  const b = porFamilia[fam];
  if (b.celdas === 0) { console.log(`  ${fam.padEnd(15)} celdas=0  ⇒ NO SE MIDIO (cero por construccion, no hallazgo)`); continue; }
  console.log(`  ${fam.padEnd(15)} celdas=${b.celdas}  ejes=[${[...b.ejes].join(",")}]`);
  console.log(`  ${"".padEnd(15)}   varia+seMueve=${b["varia+seMueve"]} · varia+noSeMueve=${b["varia+noSeMueve"]} · noVaria+seMueve=${b["noVaria+seMueve"]} · noVaria+noSeMueve=${b["noVaria+noSeMueve"]} · sinEscribir=${b.sinEscribir}`);
}
console.log("");
console.log("=== 2 · EL TEST A APLICADO SOLO, SOBRE LOS EJES ESCRITOS ===");
console.log(`  escritos ${escritos.length} · acierta ${acierta.length} · falla ${falla.length}  (${salida.testAsolo.pctFalla} % al reves)`);
console.log("");
console.log("=== 3 · LA PREMISA CALLADA ===");
console.log(`  celdas con UN SOLO valor observado: ${conUnSoloValor.length}`);
console.log(`  de esas, el valor es el INICIAL (0): ${unSoloValorYEsInicial.length}`);
console.log(`  solapan con los 31 escritos: ${solapan.length}  ⇒ ${solapan.length === 0 ? "DISJUNTOS: son dos particiones, NO dos lecturas del mismo dato" : "SOLAPAN"}`);
console.log("");
console.log("=== DIAGNOSTICO DE NIVEL ===");
const mezclan = salida.diagnosticoDeNivel.celdasQueMezclanDefaultConEditor;
console.log(`  celdas «varia+seMueve»: ${mezclan.length}`);
console.log(`  de esas, con un DEFAULT conocido entre sus valores: ${mezclan.filter((m) => m.contieneDefaultConocido).length}`);
for (const m of mezclan) console.log(`    ${m.contieneDefaultConocido ? "DEF" : "   "}  ${m.celda.padEnd(34)} ${JSON.stringify(m.valores)}`);
console.log("");
console.log(`VEREDICTO: ${salida.veredicto}`);
process.exit(nulo ? 1 : 0);
