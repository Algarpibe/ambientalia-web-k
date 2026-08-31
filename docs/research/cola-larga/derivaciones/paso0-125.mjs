// 125.ª · PASO 0 — LAS DOS FRASES QUE HAY QUE FIJAR ANTES DE QUE VIAJEN.
//
// P1 · «los tres comparten `lib/monitor` —que alcanzan 4 de las page.tsx—»
//      (PLAN-FASE-3.md §F3-5, ESCALON 1 de la 123.ª) admite DOS lecturas:
//        (a) las 3 rutas del lote importan `lib/monitor`  ← contradice la tabla
//            del propio inventario, que da `lib/accesorios` y `lib/software`;
//        (b) `lib/monitor` es alcanzado por 4 page.tsx del repo, que no tienen
//            por que ser las del lote.
//      Las dos se escriben igual. Se DERIVA cual es cierta y se reescribe la
//      frase CON SU UNIDAD — §*un denominador sin unidad no se puede auditar*.
//
// P2 · ¿los dos modos que quedan del test A (`FN-%` y `FN-bp`, 124.ª) caben en
//      `medida()` tal como esta, o le falta un eje?
//      `medida()` (campos/comunes.ts) expresa HOY:
//        · valor + unidad   ∈ {px, pct}          ← el eje de UNIDAD
//        · movilValor + movilUnidad              ← el eje de BREAKPOINT, con
//                                                  DOS posiciones: base y movil
//      Asi que la pregunta se descompone en dos censos sobre el dato REAL:
//        (2a) ¿que UNIDADES escribe el editor?      ¿caben en {px, pct}?
//        (2b) ¿cuantos BREAKPOINTS usa el editor?   ¿caben en {base, movil}?
//      Se mide sobre las reglas de ritmo cuyo selector lleva el ordinal como
//      SUJETO (§regla 36: sujeto ≠ contexto; una regla cuyo ordinal es contexto
//      declara la propiedad en un DESCENDIENTE y no se le puede atribuir).
//
// ALCANCE: los 4 documentos del lote F3-5 (`corpus/productos`). NO es el sitio.
// Lo que salga es una propiedad de estos 4 documentos, y asi se publica.

import { readFileSync, existsSync, writeFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";

const RAIZ = process.cwd();
const APP = join(RAIZ, "apps/web/src/app");
const SRC = join(RAIZ, "apps/web/src");
const CORPUS = join(RAIZ, "corpus/productos");

const DOCS = [
  { doc: "monitor-calidad-aire.html", arquetipo: "PRODUCTO", ruta: "/monitor-calidad-aire" },
  { doc: "accesorios.html", arquetipo: "CATALOGO", ruta: "/accesorios" },
  { doc: "software-de-medicion-calidad-del-aire.html", arquetipo: "SOFTWARE", ruta: "/software-de-medicion-calidad-del-aire" },
  { doc: "kunak-api.html", arquetipo: "SOFTWARE-corta", ruta: "/kunak-api" },
];

/* ── PRECONDICIONES, antes de gastar nada (§regla 37) ───────────────────── */
const faltan = [];
if (!existsSync(APP)) faltan.push(APP);
if (!existsSync(join(SRC, "lib"))) faltan.push(join(SRC, "lib"));
for (const d of DOCS) if (!existsSync(join(CORPUS, d.doc))) faltan.push(d.doc);
if (faltan.length) {
  console.error(`❌ PRECONDICION: faltan ${faltan.join(", ")}`);
  process.exit(1);
}

const controles = [];
const ctl = (ok, nombre, detalle) => { controles.push({ ok, nombre, detalle }); };

/* ═══════════════════════════════════════════════════════════════════════════
   P1 · QUE IMPORTA CADA `page.tsx`, DIRECTO Y TRANSITIVO
   ═══════════════════════════════════════════════════════════════════════════ */

/** Recorre un directorio devolviendo todos los ficheros con una extension. */
function recorre(dir, exts) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...recorre(p, exts));
    else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
}

/**
 * Imports de `@/lib/x` y `@/components/x` de un fichero, DESCONTANDO los de
 * solo tipos. El descuento se hace sobre la SENTENCIA COMPLETA —de `import`
 * hasta su `from`— porque mirar N caracteres hacia atras falla con el `}` de
 * cierre y con el import multilinea (§censo-lib-123, sobre-casado conocido).
 */
function importsDe(texto) {
  const libs = new Set(), comps = new Set(), libsTipo = new Set();
  for (const m of texto.matchAll(/import\s+([\s\S]*?)\s+from\s+["']([^"']+)["']/g)) {
    const clausula = m[1], spec = m[2];
    const soloTipos = /^\s*type\b/.test(clausula);
    if (spec.startsWith("@/lib/")) {
      (soloTipos ? libsTipo : libs).add(spec.slice("@/lib/".length));
    } else if (spec.startsWith("@/components/")) {
      comps.add(spec.slice("@/components/".length));
    }
  }
  return { libs, comps, libsTipo };
}

/** Resuelve `@/components/x` a un fichero real. */
function ficheroComponente(nombre) {
  for (const cand of [join(SRC, "components", `${nombre}.tsx`), join(SRC, "components", nombre, "index.tsx")]) {
    if (existsSync(cand)) return cand;
  }
  return null;
}

const pages = recorre(APP, ["page.tsx"]);
const cacheComp = new Map();

/** Cierre transitivo de los `@/lib/*` alcanzables desde un fichero. */
function libsTransitivos(fichero, visto = new Set()) {
  if (visto.has(fichero)) return new Set();
  visto.add(fichero);
  if (cacheComp.has(fichero)) return cacheComp.get(fichero);
  const { libs, comps } = importsDe(readFileSync(fichero, "utf8"));
  const acc = new Set(libs);
  for (const c of comps) {
    const f = ficheroComponente(c);
    if (!f) continue;
    for (const l of libsTransitivos(f, visto)) acc.add(l);
  }
  return acc;
}

const porPage = [];
for (const p of pages) {
  const texto = readFileSync(p, "utf8");
  const { libs, libsTipo } = importsDe(texto);
  const trans = libsTransitivos(p, new Set());
  porPage.push({
    page: p.slice(RAIZ.length + 1).replace(/\\/g, "/"),
    directo: [...libs].sort(),
    soloTipos: [...libsTipo].sort(),
    transitivo: [...trans].sort(),
  });
}

/* El CASCARON se deriva, no se escribe a mano: modulo alcanzado por >=90% de
   las pages (§censo-lib-123). Sin descontarlo, el transitivo es un PLENO. */
const alcance = new Map();
for (const r of porPage) for (const l of r.transitivo) alcance.set(l, (alcance.get(l) ?? 0) + 1);
const CASCARON = [...alcance].filter(([, n]) => n >= 0.9 * porPage.length).map(([l]) => l).sort();
for (const r of porPage) r.propio = r.transitivo.filter((l) => !CASCARON.includes(l));

const alcanzanMonitorDirecto = porPage.filter((r) => r.directo.includes("monitor"));
const alcanzanMonitorTrans = porPage.filter((r) => r.transitivo.includes("monitor"));

/* CONTROLES de P1 */
ctl(porPage.length > 0, "se recorrio algo (hay page.tsx)", `${porPage.length} pages`);
ctl(
  porPage.some((r) => r.page.endsWith("monitor-calidad-aire/page.tsx") && r.directo.includes("monitor")),
  "CASO CONOCIDO: /monitor-calidad-aire importa `lib/monitor` en DIRECTO",
  "si fallara, el detector no lee imports",
);
ctl(
  alcanzanMonitorTrans.length > 0 && alcanzanMonitorTrans.length < porPage.length,
  "`monitor` NO es cascaron (el transitivo discrimina, ni cero ni pleno)",
  `transitivo ${alcanzanMonitorTrans.length}/${porPage.length}`,
);
ctl(CASCARON.length > 0, "el cascaron se derivo y no esta vacio", CASCARON.join(" · "));

/* Que comparten DE VERDAD las 4 rutas del lote */
const RUTAS_LOTE = DOCS.map((d) => d.ruta);
const pageDeRuta = (ruta) => {
  const seg = ruta === "/" ? "src/app/page.tsx" : `src/app${ruta}/page.tsx`;
  return porPage.find((r) => r.page.endsWith(seg));
};
const lote = RUTAS_LOTE.map((ruta) => ({ ruta, ...(pageDeRuta(ruta) ?? { page: null }) }));
ctl(lote.every((l) => l.page), "las 4 pages del lote se resolvieron", lote.map((l) => l.ruta).join(" · "));

const interseccionPropio = lote.reduce(
  (acc, l) => (acc === null ? new Set(l.propio) : new Set([...acc].filter((x) => l.propio.includes(x)))),
  null,
);
const unionDirecto = [...new Set(lote.flatMap((l) => l.directo))].sort();

/* ═══════════════════════════════════════════════════════════════════════════
   P2 · UNIDADES Y BREAKPOINTS QUE EL EDITOR ESCRIBE
   ═══════════════════════════════════════════════════════════════════════════ */

const EJES_RITMO = ["margin-top", "margin-bottom", "padding-top", "padding-bottom", "margin", "padding"];
const ORDINAL = /^et_pb_[a-z_]+_\d+(_[a-z]+)*$/;

/**
 * §regla 36 — la clase es SUJETO si aparece en el ULTIMO compuesto del
 * selector; si aparece antes, es CONTEXTO y la propiedad cae en un
 * DESCENDIENTE. Se devuelven los dos papeles para poder publicar el reparto:
 * atribuirle a la clase lo que declara en sus hijos es un enunciado falso con
 * una medida de coartada.
 */
function papelDelOrdinal(selector) {
  if (/_tb_/.test(selector)) return "cascaron";
  let vioContexto = false;
  for (const alt of selector.split(",")) {
    const compuestos = alt.trim().split(/\s*[>+~]\s*|\s+/).filter(Boolean);
    if (!compuestos.length) continue;
    const ultimo = compuestos[compuestos.length - 1];
    const clasesDe = (c) => [...c.matchAll(/\.([A-Za-z_][\w-]*)/g)].map((m) => m[1]);
    if (clasesDe(ultimo).some((c) => ORDINAL.test(c))) return "sujeto";
    if (compuestos.slice(0, -1).some((c) => clasesDe(c).some((x) => ORDINAL.test(x)))) vioContexto = true;
  }
  return vioContexto ? "contexto" : "generico";
}

/** Unidad DECLARADA de un valor. `0` sin unidad se marca aparte: es inocuo. */
function unidadDe(bruto) {
  const v = bruto.trim();
  if (/^-?0(\.0+)?$/.test(v)) return "cero-sin-unidad";
  const m = v.match(/^-?[\d.]+([a-z%]+)$/i);
  if (m) return m[1].toLowerCase();
  if (/^-?[\d.]+$/.test(v)) return "sin-unidad";
  if (/^(auto|inherit|initial|unset)$/i.test(v)) return v.toLowerCase();
  return "otro";
}

const p2 = {};
const unidadesGlobal = new Map();
const breakpointsGlobal = new Map();
const papelGlobal = new Map();

for (const d of DOCS) {
  const h = readFileSync(join(CORPUS, d.doc), "utf8");
  const unidades = new Map();
  const bps = new Map();
  const papeles = new Map();
  const muestras = [];

  /* Recorre TODAS las reglas del documento, dentro y fuera de @media. Un
     bloque @media se recorre por su contenido; fuera de el, `contexto` = base. */
  const bloques = [];
  let resto = h;
  for (const m of h.matchAll(/@media([^{]*)\{/g)) {
    let i = m.index + m[0].length, depth = 1;
    while (i < h.length && depth > 0) { if (h[i] === "{") depth++; else if (h[i] === "}") depth--; i++; }
    bloques.push({ bp: m[1].trim(), cuerpo: h.slice(m.index + m[0].length, i - 1) });
    resto = resto.replace(h.slice(m.index, i), " ");
  }
  bloques.push({ bp: "(base)", cuerpo: resto });

  for (const b of bloques) {
    for (const r of b.cuerpo.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const sel = r[1].trim(), cuerpo = r[2];
      const papel = papelDelOrdinal(sel);
      let tocaRitmo = false;
      for (const eje of EJES_RITMO) {
        const dm = cuerpo.match(new RegExp(`(?:^|[;{\\s])${eje}\\s*:\\s*([^;!}]+)`, "i"));
        if (!dm) continue;
        tocaRitmo = true;
        if (papel !== "sujeto") continue;
        for (const bruto of dm[1].trim().split(/\s+/)) {
          const u = unidadDe(bruto);
          unidades.set(u, (unidades.get(u) ?? 0) + 1);
          unidadesGlobal.set(u, (unidadesGlobal.get(u) ?? 0) + 1);
          if (!["px", "cero-sin-unidad"].includes(u) && muestras.length < 8)
            muestras.push({ bp: b.bp, sel: sel.slice(0, 110), decl: `${eje}: ${dm[1].trim()}`, unidad: u });
        }
      }
      if (!tocaRitmo) continue;
      papeles.set(papel, (papeles.get(papel) ?? 0) + 1);
      papelGlobal.set(papel, (papelGlobal.get(papel) ?? 0) + 1);
      if (papel === "sujeto") {
        bps.set(b.bp, (bps.get(b.bp) ?? 0) + 1);
        breakpointsGlobal.set(b.bp, (breakpointsGlobal.get(b.bp) ?? 0) + 1);
      }
    }
  }
  p2[d.arquetipo] = {
    unidades: Object.fromEntries([...unidades].sort((a, b2) => b2[1] - a[1])),
    breakpoints: Object.fromEntries([...bps].sort((a, b2) => b2[1] - a[1])),
    papeles: Object.fromEntries([...papeles].sort((a, b2) => b2[1] - a[1])),
    muestras,
  };
}

/* CONTROLES de P2 */
ctl(
  (papelGlobal.get("sujeto") ?? 0) > 0 && (papelGlobal.get("generico") ?? 0) > 0,
  "§regla 36 DISCRIMINA: hay reglas de ritmo con ordinal-sujeto y genericas",
  [...papelGlobal].map(([k, v]) => `${k}=${v}`).join(" · "),
);
ctl(
  unidadesGlobal.size > 1,
  "el detector de UNIDAD no es un pleno (ve mas de una)",
  [...unidadesGlobal].map(([k, v]) => `${k}=${v}`).join(" · "),
);
ctl(
  breakpointsGlobal.size > 1,
  "el detector de BREAKPOINT no es un pleno (ve mas de uno)",
  `${breakpointsGlobal.size} distintos`,
);
/* Control en NEGATIVO del papel: una regla generica conocida NO debe salir
   sujeto. `.et_pb_button` (sin ordinal) es la del §em de este mismo documento. */
ctl(
  papelDelOrdinal(".et-db #et-boc .et-l .et_pb_button") === "generico" &&
    papelDelOrdinal(".et-db #et-boc .et-l .et_pb_text_4") === "sujeto" &&
    papelDelOrdinal(".et_pb_text_4 .et_pb_row") === "contexto",
  "CONTROL EN NEGATIVO del papel: generico/sujeto/contexto se distinguen",
  "3 selectores conocidos",
);

/* ═══════════════════════════════════════════════════════════════════════════
   INFORME
   ═══════════════════════════════════════════════════════════════════════════ */
const L = [];
const say = (s = "") => { L.push(s); console.log(s); };

say("=== CONTROLES ===");
for (const c of controles) say(`  ${c.ok ? "OK " : "❌ "} ${c.nombre}\n      ${c.detalle}`);
say();

say("=== P1 · QUE IMPORTA CADA page.tsx (unidad: PAGE.TSX) ===");
say(`  pages totales: ${porPage.length}`);
say(`  CASCARON derivado (>=90% de las pages): ${CASCARON.join(" · ") || "(ninguno)"}`);
say();
say(`  \`lib/monitor\` en DIRECTO:    ${alcanzanMonitorDirecto.length} de ${porPage.length}`);
for (const r of alcanzanMonitorDirecto) say(`      ${r.page}`);
say(`  \`lib/monitor\` TRANSITIVO:    ${alcanzanMonitorTrans.length} de ${porPage.length}`);
for (const r of alcanzanMonitorTrans) say(`      ${r.page}`);
say();
say("  EL LOTE, ruta a ruta:");
for (const l of lote) {
  say(`      ${l.ruta}`);
  say(`          directo:    ${l.directo.join(" · ") || "(ninguno)"}`);
  say(`          propio:     ${(l.propio ?? []).join(" · ") || "(ninguno)"}`);
}
say();
say(`  INTERSECCION de \`propio\` en las 4: ${[...(interseccionPropio ?? [])].sort().join(" · ") || "(VACIA)"}`);
say(`  UNION de \`directo\` en las 4:       ${unionDirecto.join(" · ")}`);
say();

say("=== P2 · UNIDADES Y BREAKPOINTS QUE ESCRIBE EL EDITOR ===");
say("  (solo reglas de ritmo con el ordinal como SUJETO — §regla 36)");
say();
say(`  PAPEL de las reglas de ritmo (los 4 docs): ${[...papelGlobal].map(([k, v]) => `${k}=${v}`).join(" · ")}`);
say();
say("  2a · UNIDADES declaradas (los 4 docs):");
for (const [u, n] of [...unidadesGlobal].sort((a, b) => b[1] - a[1])) say(`      ${u.padEnd(18)} ${n}`);
say();
say("  2b · BREAKPOINTS con ritmo del editor (los 4 docs):");
for (const [b, n] of [...breakpointsGlobal].sort((a, b2) => b2[1] - a[1])) say(`      ${String(n).padStart(4)}  ${b}`);
say();
for (const d of DOCS) {
  const r = p2[d.arquetipo];
  say(`  ${d.arquetipo}`);
  say(`      unidades:    ${Object.entries(r.unidades).map(([k, v]) => `${k}=${v}`).join(" · ")}`);
  say(`      breakpoints: ${Object.keys(r.breakpoints).length}`);
  for (const m of r.muestras) say(`      · [${m.bp}] ${m.decl}   (${m.unidad})`);
}
say();

/* VEREDICTO — se deriva, no se escribe */
const UNIDADES_MEDIDA = ["px", "pct"];
const mapaUnidad = { px: "px", "%": "pct" };
const unidadesReales = [...unidadesGlobal.keys()].filter((u) => !["cero-sin-unidad", "sin-unidad"].includes(u));
const noCaben = unidadesReales.filter((u) => !UNIDADES_MEDIDA.includes(mapaUnidad[u] ?? u));
const nBreakpoints = breakpointsGlobal.size;

say("=== VEREDICTO ===");
say(`  2a · unidades que el editor escribe: ${unidadesReales.join(" · ")}`);
say(`       \`medida()\` expresa: ${UNIDADES_MEDIDA.join(" · ")}`);
say(`       NO CABEN: ${noCaben.join(" · ") || "(ninguna)"}  ⇒ ${noCaben.length ? "LE FALTA UN EJE" : "cabe"}`);
say(`  2b · posiciones de breakpoint que el editor usa: ${nBreakpoints}`);
say(`       \`medida()\` expresa: 2 (base + movil)`);
say(`       ⇒ ${nBreakpoints > 2 ? "LE FALTA UNA POSICION" : "caben"}`);

const salida = {
  fecha: new Date().toISOString().slice(0, 10),
  tanda: 125,
  alcance: { docs: DOCS.map((d) => d.doc), pages: porPage.length, nota: "propiedad de estos 4 documentos, no del sitio" },
  controles,
  p1: {
    cascaron: CASCARON,
    monitorDirecto: alcanzanMonitorDirecto.map((r) => r.page),
    monitorTransitivo: alcanzanMonitorTrans.map((r) => r.page),
    lote,
    interseccionPropio: [...(interseccionPropio ?? [])].sort(),
    unionDirecto,
  },
  p2: {
    papeles: Object.fromEntries(papelGlobal),
    unidades: Object.fromEntries(unidadesGlobal),
    breakpoints: Object.fromEntries(breakpointsGlobal),
    porArquetipo: p2,
    veredicto: { unidadesReales, noCaben, nBreakpoints, expresaMedida: { unidades: UNIDADES_MEDIDA, posiciones: 2 } },
  },
  porPage,
};

const base = join(RAIZ, "docs/research/cola-larga/derivaciones", process.env.SALIDA || "paso0-125");
writeFileSync(`${base}.json`, JSON.stringify(salida, null, 2));
writeFileSync(`${base}.log`, L.join("\n"));
console.log(`\n→ ${base}.json  ·  ${base}.log`);
process.exit(controles.every((c) => c.ok) ? 0 : 1);
