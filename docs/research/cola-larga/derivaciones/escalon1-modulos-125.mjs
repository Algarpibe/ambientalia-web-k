// 125.ª · ESCALON 1 — EL EJE `modulos`: ¿EL COMPARADOR YA LO ALCANZA, Y A QUE COSTE?
//
// El acta de la 123.ª dice que cerrarlo «pide emitir `data-modulo` en los
// componentes, que es trabajo de otra tanda». Eso es UNA via. §regla 9, 8.º
// caso manda DERIVAR el conjunto antes de elegir entre «repuntar» y «renombrar»
// —aqui, entre «marcar el clon» y «derivar el conjunto»— y decidir con el
// numero delante. Este script pone los numeros.
//
// LAS TRES PREGUNTAS, todas offline (no hay clon servido: Docker caido):
//
//   Q1 · ¿QUE ES «UN MODULO» en el original? `.et_pb_module` casa a CUALQUIER
//        profundidad, asi que un acordeon con 30 toggles cuenta 31. Si anida,
//        el `orig` de la congelada (1..35) NO es el cardinal contra el que el
//        clon tendria que cuadrar — y una tanda que emita `data-modulo` sin
//        saberlo compararia contra un numero inflado. Es §*la causa comun: el
//        NIVEL al que se mide* con el contenedor puesto en el ANIDAMIENTO.
//
//   Q2 · ¿CUANTOS COMPONENTES habria que tocar para emitir el marcador? Se
//        deriva del cierre transitivo de las 4 `page.tsx`, no se estima.
//
//   Q3 · ¿HAY una via SIN marcador? Se contesta enseñando el reparto de
//        profundidades: si los modulos del original viven todos al mismo nivel
//        bajo su columna, un selector estructural podria bastar; si no, no.
//
// ALCANCE: los 4 documentos del lote. Lo que salga es de ellos, no del sitio.

import { readFileSync, existsSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const CORPUS = join(RAIZ, "corpus/productos");
const SRC = join(RAIZ, "apps/web/src");
const CONGELADA = join(RAIZ, "scripts/qa/medidas/productos-cmp-1440.json");

const DOCS = [
  { doc: "monitor-calidad-aire.html", arquetipo: "PRODUCTO", ruta: "/monitor-calidad-aire" },
  { doc: "accesorios.html", arquetipo: "CATALOGO", ruta: "/accesorios" },
  { doc: "software-de-medicion-calidad-del-aire.html", arquetipo: "SOFTWARE", ruta: "/software-de-medicion-calidad-del-aire" },
  { doc: "kunak-api.html", arquetipo: "SOFTWARE-corta", ruta: "/kunak-api" },
];

/* ── PRECONDICIONES antes de gastar (§regla 37) ─────────────────────────── */
const faltan = [];
for (const d of DOCS) if (!existsSync(join(CORPUS, d.doc))) faltan.push(d.doc);
if (!existsSync(CONGELADA)) faltan.push("scripts/qa/medidas/productos-cmp-1440.json");
if (!existsSync(join(SRC, "components"))) faltan.push("apps/web/src/components");
if (faltan.length) { console.error(`❌ PRECONDICION: faltan ${faltan.join(", ")}`); process.exit(1); }

const controles = [];
const ctl = (ok, nombre, detalle) => controles.push({ ok, nombre, detalle });

/* ═══════════════════════════════════════════════════════════════════════════
   Q1 · ¿ANIDAN LOS MODULOS? — recorrido del HTML con una pila de etiquetas
   ═══════════════════════════════════════════════════════════════════════════ */

const VACIOS = new Set(["img", "br", "hr", "input", "meta", "link", "source", "area", "col", "embed", "param", "track", "wbr"]);

/**
 * Recorre las etiquetas del `<body>` manteniendo la pila de ancestros, y por
 * cada nodo con `et_pb_module` anota su profundidad DE MODULO (cuantos modulos
 * hay por encima) y su columna/fila ancestro. No construye arbol: sobra.
 */
function censaModulos(html) {
  const cuerpo = html.slice(html.indexOf("<body"));
  const pila = [];
  const modulos = [];
  let enCascaron = 0;

  const TAG = /<(\/?)([a-zA-Z][\w-]*)([^>]*)>/g;
  for (const m of cuerpo.matchAll(TAG)) {
    const cierre = m[1] === "/";
    const tag = m[2].toLowerCase();
    const attrs = m[3];
    if (tag === "script" || tag === "style") continue;
    if (cierre) {
      for (let i = pila.length - 1; i >= 0; i--) {
        if (pila[i].tag === tag) { pila.length = i; break; }
      }
      continue;
    }
    if (VACIOS.has(tag) || /\/\s*$/.test(attrs)) continue;

    const cm = attrs.match(/class\s*=\s*["']([^"']*)["']/i);
    const clases = cm ? cm[1].split(/\s+/).filter(Boolean) : [];
    const esModulo = clases.includes("et_pb_module");
    const esFila = clases.includes("et_pb_row");
    const esColumna = clases.some((c) => /^et_pb_column(_|$)/.test(c));
    const esCascaron = clases.some((c) => /_tb_(header|footer)/.test(c));

    if (esModulo) {
      const enCasc = enCascaron > 0 || pila.some((p) => p.esCascaron);
      if (!enCasc) {
        const profModulo = pila.filter((p) => p.esModulo).length;
        const idxCol = pila.map((p) => p.esColumna).lastIndexOf(true);
        const idxFila = pila.map((p) => p.esFila).lastIndexOf(true);
        modulos.push({
          profModulo,
          tipo: clases.find((c) => /^et_pb_[a-z_]+$/.test(c) && c !== "et_pb_module") ?? "?",
          ordinal: clases.find((c) => /^et_pb_[a-z_]+_\d+$/.test(c)) ?? null,
          hijoDirectoDeColumna: idxCol >= 0 && idxCol === pila.length - 1,
          tieneColumna: idxCol >= 0,
          tieneFila: idxFila >= 0,
        });
      }
    }
    pila.push({ tag, esModulo, esFila, esColumna, esCascaron });
  }
  return modulos;
}

const q1 = {};
for (const d of DOCS) {
  const mods = censaModulos(readFileSync(join(CORPUS, d.doc), "utf8"));
  const porProf = {};
  for (const m of mods) porProf[m.profModulo] = (porProf[m.profModulo] ?? 0) + 1;
  q1[d.arquetipo] = {
    total: mods.length,
    primerNivel: mods.filter((m) => m.profModulo === 0).length,
    anidados: mods.filter((m) => m.profModulo > 0).length,
    porProfundidad: porProf,
    hijoDirectoDeColumna: mods.filter((m) => m.hijoDirectoDeColumna).length,
    sinColumna: mods.filter((m) => !m.tieneColumna).length,
    sinOrdinal: mods.filter((m) => !m.ordinal).length,
    tiposAnidados: [...new Set(mods.filter((m) => m.profModulo > 0).map((m) => m.tipo))].sort(),
  };
}

const totalMods = Object.values(q1).reduce((a, r) => a + r.total, 0);
const totalAnid = Object.values(q1).reduce((a, r) => a + r.anidados, 0);

ctl(totalMods > 0, "se censo algo (hay .et_pb_module en el cuerpo)", `${totalMods} modulos`);
ctl(
  Object.values(q1).every((r) => r.total > 0 && r.primerNivel > 0),
  "el censo alcanza LOS 4 documentos (ni cero ni pleno de uno)",
  DOCS.map((d) => `${d.arquetipo}=${q1[d.arquetipo].total}`).join(" · "),
);
/* CONTROL EN NEGATIVO: el descuento de cascaron tiene que MORDER. Si el mismo
   censo sin descontar da lo mismo, el descuento no hace nada y el numero no es
   de cuerpo (§regla 8: un sabotaje que no cambia el resultado no prueba nada). */
const sinDescuento = readFileSync(join(CORPUS, DOCS[0].doc), "utf8").match(/et_pb_module/g)?.length ?? 0;
ctl(
  sinDescuento > q1[DOCS[0].arquetipo].total,
  "CONTROL: el descuento de cascaron MUERDE",
  `crudo(menciones)=${sinDescuento} > cuerpo=${q1[DOCS[0].arquetipo].total}`,
);

/* ═══════════════════════════════════════════════════════════════════════════
   Q1b · CRUCE con la congelada — ¿el `orig` de `productos-cmp` es el total?
   ═══════════════════════════════════════════════════════════════════════════ */
const cong = JSON.parse(readFileSync(CONGELADA, "utf8"));
const q1b = {};
for (const inf of cong.informe) {
  const d = DOCS.find((x) => x.ruta === inf.ruta);
  if (!d) continue;
  const sumaOrig = (inf.modulosSinComparar?.porFila ?? []).reduce((a, f) => a + f.orig, 0);
  q1b[d.arquetipo] = {
    sumaOrigCongelada: sumaOrig,
    censoTotal: q1[d.arquetipo].total,
    censoPrimerNivel: q1[d.arquetipo].primerNivel,
    delta: sumaOrig - q1[d.arquetipo].total,
  };
}
ctl(
  Object.keys(q1b).length === DOCS.length,
  "las 4 rutas de la congelada cruzan con el censo",
  Object.keys(q1b).join(" · "),
);

/* ═══════════════════════════════════════════════════════════════════════════
   Q2 · CUANTOS COMPONENTES del clon habria que tocar — cierre transitivo
   ═══════════════════════════════════════════════════════════════════════════ */
function importsComp(texto) {
  const out = new Set();
  for (const m of texto.matchAll(/from\s+["']@\/components\/([^"']+)["']/g)) out.add(m[1]);
  return out;
}
function ficheroComponente(nombre) {
  for (const c of [join(SRC, "components", `${nombre}.tsx`), join(SRC, "components", nombre, "index.tsx")]) {
    if (existsSync(c)) return c;
  }
  return null;
}
function cierre(fichero, visto = new Set()) {
  if (!fichero || visto.has(fichero)) return visto;
  visto.add(fichero);
  for (const c of importsComp(readFileSync(fichero, "utf8"))) cierre(ficheroComponente(c), visto);
  return visto;
}

const compsPorRuta = {};
const todosComps = new Set();
for (const d of DOCS) {
  const p = join(SRC, "app", d.ruta.slice(1), "page.tsx");
  if (!existsSync(p)) { compsPorRuta[d.arquetipo] = null; continue; }
  const v = [...cierre(p)].filter((f) => f.includes(`components`));
  compsPorRuta[d.arquetipo] = v.map((f) => f.slice(SRC.length + 1).replace(/\\/g, "/"));
  for (const f of v) todosComps.add(f);
}
const totalFicherosComp = readdirSync(join(SRC, "components"), { recursive: true })
  .filter((f) => String(f).endsWith(".tsx")).length;

ctl(
  todosComps.size > 0 && todosComps.size < totalFicherosComp,
  "el cierre de componentes DISCRIMINA (ni cero ni todos)",
  `${todosComps.size} de ${totalFicherosComp} .tsx de components/`,
);

/* ═══════════════════════════════════════════════════════════════════════════
   INFORME
   ═══════════════════════════════════════════════════════════════════════════ */
const L = [];
const say = (s = "") => { L.push(s); console.log(s); };

say("=== CONTROLES ===");
for (const c of controles) say(`  ${c.ok ? "OK " : "❌ "} ${c.nombre}\n      ${c.detalle}`);
say();

say("=== Q1 · ¿QUE ES «UN MODULO»? (cuerpo, cascaron descontado) ===");
for (const d of DOCS) {
  const r = q1[d.arquetipo];
  say(`  ${d.arquetipo.padEnd(15)} total=${String(r.total).padStart(3)}  1er-nivel=${String(r.primerNivel).padStart(3)}  ANIDADOS=${String(r.anidados).padStart(3)}`);
  say(`      profundidades: ${JSON.stringify(r.porProfundidad)}`);
  say(`      hijo directo de columna: ${r.hijoDirectoDeColumna}/${r.total} · sin columna: ${r.sinColumna} · sin ordinal: ${r.sinOrdinal}`);
  if (r.tiposAnidados.length) say(`      tipos que anidan: ${r.tiposAnidados.join(" · ")}`);
}
say();
say(`  TOTAL 4 docs: ${totalMods} modulos, de los que ANIDADOS = ${totalAnid} (${(100 * totalAnid / totalMods).toFixed(1)} %)`);
say();

say("=== Q1b · CRUCE con `productos-cmp-1440.json` (§sondas 4: otra medida del mismo objeto) ===");
for (const [a, r] of Object.entries(q1b)) {
  say(`  ${a.padEnd(15)} congelada(suma orig)=${String(r.sumaOrigCongelada).padStart(3)}  censo(total)=${String(r.censoTotal).padStart(3)}  Δ=${r.delta}   censo(1er nivel)=${r.censoPrimerNivel}`);
}
say();

say("=== Q2 · COSTE de emitir `data-modulo` — componentes alcanzados ===");
for (const d of DOCS) {
  const v = compsPorRuta[d.arquetipo];
  say(`  ${d.arquetipo.padEnd(15)} ${v ? v.length : "(page no resuelta)"} componentes`);
}
say(`  UNION de los 4: ${todosComps.size} ficheros, de ${totalFicherosComp} .tsx en components/`);
say();

say("=== Q3 · ¿VIA SIN MARCADOR? ===");
const todosHijoDirecto = Object.values(q1).every((r) => r.hijoDirectoDeColumna === r.total);
say(`  ¿todos los modulos son hijo DIRECTO de su columna? ${todosHijoDirecto ? "SI" : "NO"}`);
say(`  ⇒ ${todosHijoDirecto
  ? "un selector estructural (hijos de columna) denotaria el mismo conjunto"
  : "NO: hay modulos a otra profundidad, asi que ningun selector estructural del clon los denota sin marcador"}`);

const salida = {
  fecha: new Date().toISOString().slice(0, 10),
  tanda: 125,
  escalon: 1,
  alcance: { docs: DOCS.map((d) => d.doc), nota: "propiedad de estos 4 documentos, no del sitio" },
  controles,
  q1, q1b,
  q2: { porArquetipo: compsPorRuta, union: [...todosComps].map((f) => f.slice(SRC.length + 1).replace(/\\/g, "/")), totalFicherosComponents: totalFicherosComp },
  q3: { todosHijoDirectoDeColumna: todosHijoDirecto },
};

const base = join(RAIZ, "docs/research/cola-larga/derivaciones", process.env.SALIDA || "escalon1-modulos-125");
writeFileSync(`${base}.json`, JSON.stringify(salida, null, 2));
writeFileSync(`${base}.log`, L.join("\n"));
console.log(`\n→ ${base}.json  ·  ${base}.log`);
process.exit(controles.every((c) => c.ok) ? 0 : 1);
