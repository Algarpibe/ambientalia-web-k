// 126.ª · PASO 0 — FIJAR EL CRITERIO DE «UN MODULO», Y RECONCILIAR 420 / 105
//
// Dos preguntas, las dos OFFLINE (corpus congelado + las dos congeladas de la
// 125.ª). No levanta navegador y no toca la red: lo que decide es de MODELO.
//
//   Q1 · ¿QUE CUENTA COMO «UN MODULO»? La 125.ª publico TRES cardinales ciertos
//        por documento —110 · 90 · 83— y ninguno es «el» numero. El content
//        type no se puede escribir sobre una definicion ambigua: el array de
//        modulos quedaria sin poder auditarse. Aqui se cruza PROFUNDIDAD contra
//        LLAVE y se elige uno, dejando los otros dos NOMBRADOS CON SU UNIDAD
//        (§*corregir un denominador no es sustituirlo en todas partes*).
//
//   Q1b · ¿ES EL 83 UN CRITERIO DE MODULO? Se comprueba en la congelada, no se
//        argumenta: si `porFila` va `slice(0, min(nO,nC))`, entonces el 83 no
//        dice que cuenta como modulo — dice cuantos modulos caben en las filas
//        que el emparejamiento dejo vivas. Es §*la causa comun: el NIVEL al que
//        se mide* con el contenedor puesto en el EMPAREJAMIENTO.
//
//   Q2 · 420 CONTRA 105. La 123.ª escribio «420 sin llave» y la 125.ª «105».
//        O es una correccion, o son dos unidades. Se deriva —el numero de EJES
//        se lee DEL FUENTE de la 123.ª, no se recuerda— y se cruza al ELEMENTO
//        con las dos congeladas, porque un cardinal es un contenedor y absorbe
//        la membresia: `105 == 105` no prueba que sean los mismos 105.
//
// ALCANCE: los 4 documentos del lote F3-5. Lo que salga es de ellos, no del
// sitio. El eje CAJA no se mide aqui (exige navegador): se declara con su
// cardinal donde toca, nunca se rellena.

import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const CORPUS = join(RAIZ, "corpus/productos");
const DERIV = join(RAIZ, "docs/research/cola-larga/derivaciones");
const CONGELADA = join(RAIZ, "scripts/qa/medidas/productos-cmp-1440.json");
const ESC1 = join(DERIV, "escalon1-modulos-125.json");
const ESC2 = join(DERIV, "escalon2-llaves-125.json");
const FUENTE_123 = join(DERIV, "tests-ab-123.mjs");

const DOCS = [
  { doc: "monitor-calidad-aire.html", arquetipo: "PRODUCTO" },
  { doc: "accesorios.html", arquetipo: "CATALOGO" },
  { doc: "software-de-medicion-calidad-del-aire.html", arquetipo: "SOFTWARE" },
  { doc: "kunak-api.html", arquetipo: "SOFTWARE-corta" },
];

/* ── PRECONDICIONES ANTES DE GASTAR (§regla 37) ──────────────────────────────
 * Todas las entradas son ficheros que esta corrida NO produce, asi que se
 * comprueban ARRIBA. Una precondicion tardia no da un numero falso: cuesta la
 * corrida entera. */
const faltan = [];
for (const d of DOCS) if (!existsSync(join(CORPUS, d.doc))) faltan.push(`corpus/productos/${d.doc}`);
for (const [n, p] of [["productos-cmp-1440.json", CONGELADA], ["escalon1-modulos-125.json", ESC1], ["escalon2-llaves-125.json", ESC2], ["tests-ab-123.mjs", FUENTE_123]])
  if (!existsSync(p)) faltan.push(n);
if (faltan.length) {
  console.error(`❌ PRECONDICION: faltan ${faltan.join(", ")}`);
  process.exit(1);
}

const controles = [];
const ctl = (ok, nombre, detalle) => controles.push({ ok, nombre, detalle });

/* ═══════════════════════════════════════════════════════════════════════════
   Q1 · CENSO — PROFUNDIDAD × LLAVE
   El recorrido es el del escalon 1, COPIADO sin tocar, para que lo que difiera
   no pueda venir de aqui. Lo unico que se añade son las TRES llaves de la
   125.ª, que ya estan derivadas y acreditadas por su cruce.
   ═══════════════════════════════════════════════════════════════════════════ */

const VACIOS = new Set(["img", "br", "hr", "input", "meta", "link", "source", "area", "col", "embed", "param", "track", "wbr"]);

/** Las TRES llaves de la 125.ª, sobre la lista de clases de un nodo. */
function llavesDe(clases) {
  /* vieja (123.ª): el ordinal tiene que ser la clase ENTERA. */
  const vieja = clases.find((c) => /^et_pb_[a-z_]+_\d+$/.test(c)) ?? null;
  /* mejorada (124.ª): admite SUFIJO tras el ordinal; descarta todo `_tb_`. */
  const mejorada = clases.find((c) => /^et_pb_[a-z_]+_\d+(_[a-z]+)*$/.test(c) && !/_tb_/.test(c)) ?? null;
  /* tercera (125.ª): §regla 25 — el descarte de `_tb_` es mas ancho que su
     invariante. Solo el CASCARON queda fuera; `_tb_body` es CUERPO. */
  const tbBody = clases.find((c) => /^et_pb_[a-z_]+_\d+(_[a-z]+)*$/.test(c) && !/_tb_(header|footer)/.test(c)) ?? null;
  return { vieja, mejorada, tbBody };
}

function censaModulos(html) {
  const cuerpo = html.slice(html.indexOf("<body"));
  const pila = [];
  const modulos = [];

  const TAG = /<(\/?)([a-zA-Z][\w-]*)([^>]*)>/g;
  for (const m of cuerpo.matchAll(TAG)) {
    const cierre = m[1] === "/";
    const tag = m[2].toLowerCase();
    const attrs = m[3];
    if (tag === "script" || tag === "style") continue;
    if (cierre) {
      for (let i = pila.length - 1; i >= 0; i--) if (pila[i].tag === tag) { pila.length = i; break; }
      continue;
    }
    if (VACIOS.has(tag) || /\/\s*$/.test(attrs)) continue;

    const cm = attrs.match(/class\s*=\s*["']([^"']*)["']/i);
    const clases = cm ? cm[1].split(/\s+/).filter(Boolean) : [];
    const esModulo = clases.includes("et_pb_module");
    const esFila = clases.includes("et_pb_row");
    const esColumna = clases.some((c) => /^et_pb_column(_|$)/.test(c));
    const esCascaron = clases.some((c) => /_tb_(header|footer)/.test(c));

    if (esModulo && !pila.some((p) => p.esCascaron) && !esCascaron) {
      const idxFila = pila.map((p) => p.esFila).lastIndexOf(true);
      modulos.push({
        profModulo: pila.filter((p) => p.esModulo).length,
        tipo: clases.find((c) => /^et_pb_[a-z_]+$/.test(c) && c !== "et_pb_module") ?? clases.find((c) => /^dvmd_/.test(c)) ?? "?",
        ...llavesDe(clases),
        fila: idxFila,
      });
    }
    pila.push({ tag, esModulo, esFila, esColumna, esCascaron });
  }
  return modulos;
}

const q1 = {};
for (const d of DOCS) {
  const mods = censaModulos(readFileSync(join(CORPUS, d.doc), "utf8"));
  const n0 = mods.filter((m) => m.profModulo === 0);
  const nA = mods.filter((m) => m.profModulo > 0);
  const conLlave3 = (m) => !!m.tbBody;      // la llave depurada de la 125.ª
  const conLlave1 = (m) => !!m.vieja;       // la llave de la 123.ª
  q1[d.arquetipo] = {
    enElDOM: mods.length,
    primerNivel: n0.length,
    anidados: nA.length,
    /* Reparto PROFUNDIDAD × LLAVE, en NODOS. Los cuatro cubos son excluyentes
       y su suma se controla abajo. */
    n0ConLlave: n0.filter(conLlave3).length,
    n0SinLlave: n0.filter((m) => !conLlave3(m)).length,
    nAConLlave: nA.filter(conLlave3).length,
    nASinLlave: nA.filter((m) => !conLlave3(m)).length,
    /* Con la llave VIEJA, para reproducir el 105 de la 125.ª. */
    sinLlaveVieja: mods.filter((m) => !conLlave1(m)).length,
    sinLlaveDepurada: mods.filter((m) => !conLlave3(m)).length,
    tiposAnidados: [...new Set(nA.map((m) => m.tipo))].sort(),
    tiposSinLlaveDepurada: Object.fromEntries(
      [...mods.filter((m) => !conLlave3(m)).reduce((a, m) => a.set(m.tipo, (a.get(m.tipo) ?? 0) + 1), new Map())].sort((x, y) => y[1] - x[1]),
    ),
  };
}

const S = (k) => Object.values(q1).reduce((a, r) => a + r[k], 0);

ctl(S("enElDOM") > 0, "se censo algo (hay .et_pb_module en el cuerpo)", `${S("enElDOM")} modulos`);
ctl(
  Object.values(q1).every((r) => r.enElDOM > 0 && r.primerNivel > 0),
  "el censo alcanza LOS 4 documentos (ni cero ni pleno de uno)",
  DOCS.map((d) => `${d.arquetipo}=${q1[d.arquetipo].enElDOM}`).join(" · "),
);
/* CONTROL EN NEGATIVO — el descuento de cascaron tiene que MORDER, o el numero
   no es de cuerpo (§regla 8: un sabotaje que no cambia el resultado no prueba
   nada, solo que el instrumento no lo ejercita). */
const crudo = (readFileSync(join(CORPUS, DOCS[0].doc), "utf8").match(/et_pb_module/g) ?? []).length;
ctl(crudo > q1.PRODUCTO.enElDOM, "CONTROL: el descuento de cascaron MUERDE", `crudo(menciones)=${crudo} > cuerpo=${q1.PRODUCTO.enElDOM}`);
/* La PROFUNDIDAD tiene que discriminar: si todo cae en un nivel, el eje no
   separa nada y los dos cardinales serian el mismo (§*0 separadoras*). */
ctl(S("anidados") > 0 && S("primerNivel") > 0, "el eje PROFUNDIDAD discrimina (ni cero ni pleno)", `1er nivel=${S("primerNivel")} · anidados=${S("anidados")}`);
/* La LLAVE tambien: ni todos con llave ni ninguno. */
ctl(
  S("sinLlaveDepurada") > 0 && S("sinLlaveDepurada") < S("enElDOM"),
  "el eje LLAVE discrimina (ni cero ni pleno)",
  `sin llave (depurada)=${S("sinLlaveDepurada")} de ${S("enElDOM")}`,
);
/* PARTICION: los cuatro cubos suman el total, en los 4 documentos. */
const particionOK = Object.values(q1).every((r) => r.n0ConLlave + r.n0SinLlave + r.nAConLlave + r.nASinLlave === r.enElDOM);
ctl(particionOK, "el reparto PROFUNDIDAD x LLAVE es una PARTICION (suma el total en 4/4)", `${S("n0ConLlave")} + ${S("n0SinLlave")} + ${S("nAConLlave")} + ${S("nASinLlave")} = ${S("enElDOM")}`);

/* ── CRUCE 1 · con el escalon 1 de la 125.ª, AL ELEMENTO ────────────────────
 * §sondas 4: cuando exista otra medicion del mismo objeto, cruzarla es
 * obligatorio ANTES de creerse un recuento nuevo. Y se cruza por documento, no
 * por total: un cardinal absorbe la membresia. */
const e1 = JSON.parse(readFileSync(ESC1, "utf8"));
const e1q1 = e1.q1 ?? e1.Q1 ?? null;
const cruce1 = DOCS.map((d) => {
  const mio = q1[d.arquetipo];
  const suyo = e1q1?.[d.arquetipo] ?? null;
  return {
    arquetipo: d.arquetipo,
    total: { mio: mio.enElDOM, suyo: suyo?.total ?? null, ok: suyo ? mio.enElDOM === suyo.total : null },
    primerNivel: { mio: mio.primerNivel, suyo: suyo?.primerNivel ?? null, ok: suyo ? mio.primerNivel === suyo.primerNivel : null },
    sinOrdinal: { mio: mio.sinLlaveVieja, suyo: suyo?.sinOrdinal ?? null, ok: suyo ? mio.sinLlaveVieja === suyo.sinOrdinal : null },
  };
});
const cruce1OK = cruce1.every((c) => c.total.ok && c.primerNivel.ok && c.sinOrdinal.ok);
ctl(cruce1OK, "CRUCE con el escalon 1 (125.ª): total, 1er nivel y sin-ordinal REPRODUCEN en 4/4", cruce1.map((c) => `${c.arquetipo} ${c.total.mio}/${c.primerNivel.mio}/${c.sinOrdinal.mio}`).join(" · "));

/* ── CRUCE 2 · con el escalon 2 de la 125.ª, AL ELEMENTO ──────────────────── */
const e2 = JSON.parse(readFileSync(ESC2, "utf8"));
const cruce2 = DOCS.map((d) => ({
  arquetipo: d.arquetipo,
  mio: q1[d.arquetipo].sinLlaveVieja,
  suyo: e2.porDoc?.[d.arquetipo]?.sinLlave1440 ?? null,
  ok: e2.porDoc?.[d.arquetipo]?.sinLlave1440 === q1[d.arquetipo].sinLlaveVieja,
}));
const cruce2OK = cruce2.every((c) => c.ok);
ctl(cruce2OK, "CRUCE con el escalon 2 (125.ª): `sinLlave` POR DOCUMENTO reproduce en 4/4", cruce2.map((c) => `${c.arquetipo} ${c.mio}=${c.suyo}`).join(" · "));

/* ═══════════════════════════════════════════════════════════════════════════
   Q1b · ¿ES EL 83 UN CRITERIO? — se le pregunta a la congelada
   ═══════════════════════════════════════════════════════════════════════════ */
const cong = JSON.parse(readFileSync(CONGELADA, "utf8"));
const q1b = Object.values(cong.informe).map((r) => {
  const pf = r.modulosSinComparar.porFila;
  return {
    arquetipo: r.arquetipo,
    filasConCajaOrig: r.filas.orig,
    filasConCajaClon: r.filas.clon,
    filasListadas: pf.length,
    filasHuerfanas: r.filas.orig - pf.length,
    sumaOrig: pf.reduce((a, x) => a + x.orig, 0),
  };
});
const truncaEn4de4 = q1b.every((x) => x.filasListadas === Math.min(x.filasConCajaOrig, x.filasConCajaClon) && x.filasHuerfanas > 0);
ctl(
  truncaEn4de4,
  "el `83` esta TRUNCADO por el emparejamiento: `porFila` = min(orig,clon) y sobra >=1 fila en 4/4",
  q1b.map((x) => `${x.arquetipo} ${x.filasListadas}/${x.filasConCajaOrig} filas (huerfanas ${x.filasHuerfanas}) suma=${x.sumaOrig}`).join(" · "),
);
/* Control cruzado: el `huerfanasO` que la propia congelada publica tiene que
   coincidir con la suma de huerfanas que acabo de derivar. Si no, uno de los
   dos numeros no describe lo que dice describir. */
const huerfSuma = q1b.reduce((a, x) => a + x.filasHuerfanas, 0);
ctl(
  huerfSuma === cong.resumen.huerfanasO,
  "CONTROL: las huerfanas derivadas cuadran con el `huerfanasO` que publica la congelada",
  `derivadas=${huerfSuma} · publicado=${cong.resumen.huerfanasO}`,
);

/* ═══════════════════════════════════════════════════════════════════════════
   Q2 · 420 CONTRA 105 — ¿correccion, o dos unidades?
   El numero de EJES se LEE DEL FUENTE de la 123.ª (§regla 9: un numero
   recordado y uno derivado se escriben igual y no valen lo mismo).
   ═══════════════════════════════════════════════════════════════════════════ */
const src123 = readFileSync(FUENTE_123, "utf8");
const mEjes = src123.match(/^const EJES = \[([^\]]*)\]/m);
const ejes123 = mEjes ? mEjes[1].split(",").map((s) => s.trim().replace(/["']/g, "")).filter(Boolean) : [];
ctl(ejes123.length > 0, "los EJES de la 123.ª se DERIVAN de su fuente (no se recuerdan)", `${ejes123.length} ejes: ${ejes123.join(" · ")}`);

const nodosSinLlave = S("sinLlaveVieja");
const paresEsperados = nodosSinLlave * ejes123.length;
ctl(
  paresEsperados === 420,
  "la reconciliacion CIERRA: nodos sin llave x ejes de la 123.ª = los pares que publico",
  `${nodosSinLlave} nodos x ${ejes123.length} ejes = ${paresEsperados} pares`,
);
/* Y el CONTROL que impide leerlo como una correccion: los dos numeros tienen
   que ser CIERTOS A LA VEZ, cada uno en su unidad. Si 420 fuera un error, no
   habria un divisor entero que lo llevara a 105. */
ctl(
  420 % nodosSinLlave === 0 && 420 / nodosSinLlave === ejes123.length,
  "NO es una correccion: 420 y 105 son el MISMO conjunto en dos unidades",
  `420 PARES (nodo x eje) / ${ejes123.length} ejes = ${420 / ejes123.length} NODOS`,
);

/* ── El universo de cada escalon, para que nadie los cruce por el total ───── */
const universos = {
  "escalon 1 (125.ª)": { unidad: "modulo del CUERPO en el DOM", n: S("enElDOM"), tipos: [".et_pb_module"] },
  "escalon 2 (125.ª)": { unidad: "nodo CON CAJA @1440", n: e2.totales?.nodos ?? null, tipos: [".et_pb_section", ".et_pb_row", ".et_pb_module"] },
};
ctl(
  universos["escalon 2 (125.ª)"].n !== universos["escalon 1 (125.ª)"].n,
  "los DOS censos de la 125.ª NO cuentan la misma unidad — y por eso no se cruzan por el total",
  `escalon 1 = ${universos["escalon 1 (125.ª)"].n} modulos · escalon 2 = ${universos["escalon 2 (125.ª)"].n} nodos (seccion+fila+modulo)`,
);

/* ═══════════════════════════════════════════════════════════════════════════
   SALIDA
   ═══════════════════════════════════════════════════════════════════════════ */
const CRITERIO = {
  elegido: {
    nombre: "MODULO DE PRIMER NIVEL DEL CUERPO",
    definicion: "nodo `.et_pb_module` que NO cuelga de otro `.et_pb_module`, con el cascaron (`_tb_header`/`_tb_footer`) descontado",
    unidad: "modulo de primer nivel",
    cardinal: Object.fromEntries(DOCS.map((d) => [d.arquetipo, q1[d.arquetipo].primerNivel])),
    total: S("primerNivel"),
  },
  noElegidos: [
    {
      nombre: "TODOS LOS MODULOS DEL CUERPO",
      unidad: "nodo `.et_pb_module` del cuerpo EN EL DOM, a cualquier profundidad",
      cardinal: Object.fromEntries(DOCS.map((d) => [d.arquetipo, q1[d.arquetipo].enElDOM])),
      total: S("enElDOM"),
      cierto: true,
    },
    {
      nombre: "MODULOS CON CAJA EN LAS FILAS EMPAREJADAS",
      unidad: "modulo con caja @1440, dentro de las min(orig,clon) primeras filas con caja",
      cardinal: Object.fromEntries(q1b.map((x) => [x.arquetipo, x.sumaOrig])),
      total: q1b.reduce((a, x) => a + x.sumaOrig, 0),
      cierto: true,
      advertencia: "NO es un criterio de modulo: mezcla el filtro de CAJA con el TRUNCADO del emparejamiento (1 fila huerfana por documento, 4/4)",
    },
  ],
};

const salida = {
  fecha: new Date().toISOString().slice(0, 10),
  tanda: 126,
  escalon: "PASO 0",
  alcance: { docs: DOCS.map((d) => d.doc), unidad: "modulo del CUERPO (cascaron descontado)", nota: "propiedad de estos 4 documentos, no del sitio" },
  controles,
  criterio: CRITERIO,
  q1,
  q1b,
  q2: {
    pregunta: "¿420 y 105 son una correccion, o dos unidades del mismo conjunto?",
    veredicto: "DOS UNIDADES. Ninguno sustituye al otro.",
    ejes123,
    nodos: nodosSinLlave,
    pares: paresEsperados,
    cruce1,
    cruce2,
  },
  universos,
};

/* La guarda de `w()` NO alcanza a `derivaciones/` (§regla 5, primera fuga): una
   corrida de verificacion pisaria a la del diagnostico. Se refusa a pisar. */
for (const [ruta, texto] of [
  [join(DERIV, "paso0-criterio-126.json"), JSON.stringify(salida, null, 1)],
]) {
  if (existsSync(ruta) && readFileSync(ruta, "utf8") !== texto) {
    console.error(`❌ ${ruta} ya existe y DIFIERE — no se pisa (§regla 5).`);
    process.exit(1);
  }
  writeFileSync(ruta, texto);
}

/* ── INFORME ─────────────────────────────────────────────────────────────── */
const L = [];
const say = (s) => { L.push(s); console.log(s); };

say("=== CONTROLES ===");
for (const c of controles) say(`  ${c.ok ? "OK " : "FALLA"} ${c.nombre}\n      ${c.detalle}`);

say("\n=== Q1 · PROFUNDIDAD x LLAVE (nodos, cuerpo, cascaron descontado) ===");
say("  documento        DOM  1erNiv  anid | 1N+llave 1N-llave  An+llave An-llave");
for (const d of DOCS) {
  const r = q1[d.arquetipo];
  say(`  ${d.arquetipo.padEnd(15)} ${String(r.enElDOM).padStart(4)} ${String(r.primerNivel).padStart(6)} ${String(r.anidados).padStart(6)} | ${String(r.n0ConLlave).padStart(8)} ${String(r.n0SinLlave).padStart(8)}  ${String(r.nAConLlave).padStart(8)} ${String(r.nASinLlave).padStart(8)}`);
}
say(`  ${"TOTAL".padEnd(15)} ${String(S("enElDOM")).padStart(4)} ${String(S("primerNivel")).padStart(6)} ${String(S("anidados")).padStart(6)} | ${String(S("n0ConLlave")).padStart(8)} ${String(S("n0SinLlave")).padStart(8)}  ${String(S("nAConLlave")).padStart(8)} ${String(S("nASinLlave")).padStart(8)}`);
say("\n  tipos SIN LLAVE (depurada), por documento:");
for (const d of DOCS) say(`  ${d.arquetipo.padEnd(15)} ${JSON.stringify(q1[d.arquetipo].tiposSinLlaveDepurada)}`);

say("\n=== Q1b · ¿ES EL 83 UN CRITERIO DE MODULO? ===");
for (const x of q1b) say(`  ${x.arquetipo.padEnd(15)} filas con caja orig=${x.filasConCajaOrig} clon=${x.filasConCajaClon} · LISTADAS=${x.filasListadas} · HUERFANAS=${x.filasHuerfanas} · suma=${x.sumaOrig}`);
say(`  ⇒ el cardinal 83/33/66/33 esta TRUNCADO: no dice que cuenta como modulo,`);
say(`    dice cuantos caben en las filas que el emparejamiento dejo vivas.`);

say("\n=== Q2 · 420 CONTRA 105 ===");
say(`  EJES de la 123.ª, leidos de su fuente: ${ejes123.length} — ${ejes123.join(" · ")}`);
say(`  nodos sin llave (llave de la 123.ª), derivados aqui: ${nodosSinLlave}`);
say(`  ${nodosSinLlave} nodos x ${ejes123.length} ejes = ${paresEsperados} pares`);
say(`  ⇒ NO es una correccion: 420 PARES (nodo x eje) y 105 NODOS son ciertos a la vez.`);
say("  cruce POR DOCUMENTO (no por total) con las dos congeladas de la 125.ª:");
for (const c of cruce2) say(`    ${c.arquetipo.padEnd(15)} yo=${c.mio}  escalon2=${c.suyo}  ${c.ok ? "OK" : "FALLA"}`);

say("\n=== CRITERIO FIJADO ===");
say(`  ELEGIDO   : ${CRITERIO.elegido.nombre} — ${CRITERIO.elegido.total} en los 4 docs`);
say(`              ${JSON.stringify(CRITERIO.elegido.cardinal)}`);
for (const n of CRITERIO.noElegidos) {
  say(`  NO elegido: ${n.nombre} — ${n.total} · unidad: ${n.unidad}`);
  if (n.advertencia) say(`              ⚠ ${n.advertencia}`);
}

const fallos = controles.filter((c) => !c.ok);
say(`\n✓ evaluadas ${DOCS.length}/${DOCS.length} documentos · controles ${controles.length - fallos.length}/${controles.length}`);
writeFileSync(join(DERIV, "paso0-criterio-126.log"), L.join("\n") + "\n");
if (fallos.length) { console.error(`❌ ${fallos.length} control(es) en rojo`); process.exit(1); }
