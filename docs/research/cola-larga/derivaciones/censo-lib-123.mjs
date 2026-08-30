// 123.ª · PASO 0 — RE-DERIVAR el censo de arquetipos que leen contenido de src/lib.
//
// Deriva, NO cita (§regla 9). El censo de la 119.ª dio 4 · 10 · 13 «según la
// unidad»; aquí se publican LAS TRES unidades con su definición al lado, porque
// un denominador sin unidad no se puede auditar (§*corregir un denominador no es
// sustituirlo en todas partes*).
//
// LAS TRES UNIDADES, y son conjuntos distintos, no tres lecturas del mismo:
//   A · MODULO   — ficheros de src/lib clasificados CONTENIDO
//   B · PAGE     — ficheros page.tsx que alcanzan un MODULO de contenido
//   C · RUTA     — rutas que el build emite desde esos page.tsx (las dinámicas
//                  valen n, no 1)
//
// El alcance de B se mide por DOS canales, porque un page.tsx puede leer
// contenido sin importarlo él (§*la salida servida incluye el canal que no
// estabas mirando*):
//   directo    — import "@/lib/x" en el propio page.tsx
//   transitivo — page.tsx → componente(s) → "@/lib/x", cierre a punto fijo
//
// CONTROL (§regla 8): un negativo sin control no es un negativo. Aquí el control
// es que el clasificador CONTENIDO/helper reproduzca a mano dos casos conocidos
// —utils.ts es helper, monitor.ts es contenido— y que el cierre transitivo sea
// un superconjunto del directo. Si alguno falla, la corrida es NULA.

import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { join, relative, basename } from "node:path";

const WEB = "apps/web";
const SRC = join(WEB, "src");
const LIB = join(SRC, "lib");
const APP = join(SRC, "app");

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}

// ── 1 · CLASIFICAR los módulos de src/lib ────────────────────────────────────
// El discriminador se DERIVA del fichero, no de una lista escrita a mano
// (§regla 9, 7.º caso). Un módulo de CONTENIDO exporta constantes cuyo valor es
// un literal de datos; un helper exporta funciones; un módulo de tipos sólo
// exporta tipos.
function clasificaModulo(ruta) {
  const src = readFileSync(ruta, "utf8");
  // exports de valor: const/let cuyo inicializador es literal de datos
  const datos = [...src.matchAll(/^export\s+const\s+([A-Za-z0-9_]+)[^=]*=\s*([[{"'`])/gm)];
  const funcs = [
    ...src.matchAll(/^export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/gm),
    ...src.matchAll(/^export\s+const\s+([A-Za-z0-9_]+)[^=]*=\s*(?:async\s*)?\([^)]*\)\s*(?::[^=]*)?=>/gm),
  ];
  const tipos = [...src.matchAll(/^export\s+(?:type|interface)\s+([A-Za-z0-9_]+)/gm)];
  // Un `const X = (...)=>` casa las DOS primeras: se descuenta de datos.
  const nombresFunc = new Set(funcs.map((m) => m[1]));
  const nDatos = datos.filter((m) => !nombresFunc.has(m[1])).length;
  return {
    modulo: basename(ruta),
    nDatos,
    nFuncs: nombresFunc.size,
    nTipos: tipos.length,
    bytes: src.length,
    // CONTENIDO = exporta al menos una constante de datos.
    esContenido: nDatos > 0,
  };
}

const modulos = readdirSync(LIB, { withFileTypes: true })
  .filter((e) => e.isFile() && /\.ts$/.test(e.name))
  .map((e) => clasificaModulo(join(LIB, e.name)))
  .sort((a, b) => a.modulo.localeCompare(b.modulo));

const contenido = new Set(modulos.filter((m) => m.esContenido).map((m) => m.modulo.replace(/\.ts$/, "")));

// ── 2 · GRAFO de imports de todo src ─────────────────────────────────────────
const ficheros = walk(SRC);
const importsDe = new Map(); // ruta rel → {libs:Set, locales:Set}

function resuelveLocal(espec) {
  // "@/components/X" | "@/lib/x" → ruta rel dentro de src
  if (!espec.startsWith("@/")) return null;
  const base = join(SRC, espec.slice(2));
  for (const cand of [base + ".tsx", base + ".ts", join(base, "index.tsx"), join(base, "index.ts")]) {
    if (existsSync(cand)) return cand.replace(/\\/g, "/");
  }
  return null;
}

// ⚠ El descuento de `import type` NO se hace mirando N caracteres hacia atras.
// La v1 usaba /import\s+type\s*\{[^}]*$/ sobre los 200 anteriores y fallaba en
// los dos casos frecuentes —el `}` de cierre antes de `from`, y el import
// MULTILINEA— asi que colaba 13 imports de SOLO TIPOS como si fueran contenido y
// metia SECTOR y MONOGRAFICO en el alcance de la fase. Es §sondas 4 en su cara
// de SOBRE-CASADO, cometida dentro del propio instrumento.
//
// Lo que discrimina es el STATEMENT entero: se busca hacia atras el `import` que
// abre, y se mira si lleva `type` inmediatamente detras.
function esSoloTipo(src, idxFrom) {
  const abre = src.lastIndexOf("import", idxFrom);
  if (abre < 0) return false;
  const stmt = src.slice(abre, idxFrom);
  // `import type {...} from` | `import type X from`
  if (/^import\s+type\b/.test(stmt)) return true;
  // `import {...} from` donde TODOS los especificadores llevan `type`
  const llaves = stmt.match(/\{([\s\S]*)\}/);
  if (llaves) {
    const items = llaves[1].split(",").map((s) => s.trim()).filter(Boolean);
    if (items.length && items.every((i) => /^type\s/.test(i))) return true;
  }
  return false;
}

for (const f of ficheros) {
  const src = readFileSync(f, "utf8");
  const libs = new Set();
  const locales = new Set();
  for (const m of src.matchAll(/from\s+["']([^"']+)["']/g)) {
    const espec = m[1];
    if (espec.startsWith("@/lib/")) {
      const nombre = espec.slice("@/lib/".length).split("/")[0];
      if (!esSoloTipo(src, m.index) && contenido.has(nombre)) libs.add(nombre);
    }
    const loc = resuelveLocal(espec);
    if (loc) locales.add(loc.replace(/\\/g, "/"));
  }
  importsDe.set(f.replace(/\\/g, "/"), { libs, locales });
}

// cierre transitivo a punto fijo
function alcanza(inicio) {
  const vistos = new Set();
  const libs = new Set();
  const pila = [inicio.replace(/\\/g, "/")];
  while (pila.length) {
    const n = pila.pop();
    if (vistos.has(n)) continue;
    vistos.add(n);
    const e = importsDe.get(n);
    if (!e) continue;
    for (const l of e.libs) libs.add(l);
    for (const c of e.locales) if (!vistos.has(c)) pila.push(c);
  }
  return libs;
}

const pages = walk(APP).filter((f) => /page\.tsx$/.test(f));
const filas = pages.map((p) => {
  const rel = p.replace(/\\/g, "/");
  const directo = [...(importsDe.get(rel)?.libs ?? [])].sort();
  const trans = [...alcanza(rel)].sort();
  return {
    page: relative(APP, p).replace(/\\/g, "/"),
    ruta: "/" + relative(APP, p).replace(/\\/g, "/").replace(/\/?page\.tsx$/, ""),
    dinamica: /\[/.test(p),
    directo,
    transitivo: trans,
    soloTransitivo: trans.filter((x) => !directo.includes(x)),
  };
});

// ── 3 · CONTROLES ────────────────────────────────────────────────────────────
const controles = [];
const utils = modulos.find((m) => m.modulo === "utils.ts");
controles.push({
  nombre: "utils.ts clasifica HELPER",
  ok: utils ? utils.esContenido === false : false,
  visto: utils ? `nDatos=${utils.nDatos} nFuncs=${utils.nFuncs}` : "no existe",
});
const mon = modulos.find((m) => m.modulo === "monitor.ts");
controles.push({
  nombre: "monitor.ts clasifica CONTENIDO",
  ok: mon ? mon.esContenido === true : false,
  visto: mon ? `nDatos=${mon.nDatos}` : "no existe",
});
const superset = filas.every((f) => f.directo.every((d) => f.transitivo.includes(d)));
controles.push({
  nombre: "transitivo ⊇ directo en las N pages",
  ok: superset,
  visto: `${filas.length} pages`,
});
// el grafo tiene que ver aristas: si 0 locales resueltas, el resolutor está roto
const aristas = [...importsDe.values()].reduce((a, e) => a + e.locales.size, 0);
controles.push({
  nombre: "el resolutor de @/ casa (aristas > 0)",
  ok: aristas > 0,
  visto: `${aristas} aristas locales`,
});

// CONTROL del descuento de `import type`, contra un caso CONOCIDO de antemano y
// verificado a mano: los 13 imports de @/lib/sectores y @/lib/monografico que
// hay en src/ son TODOS `import type`, asi que ningun fichero puede declararlos
// como contenido. Es la comprobacion que delato el sobre-casado de la v1
// —contradecia a PLAN-FASE-3 §F3-5, que ya tenia SECTOR fuera del alcance—.
const falsosTipo = [...importsDe.entries()]
  .filter(([, e]) => e.libs.has("sectores") || e.libs.has("monografico"))
  .map(([f]) => f);
controles.push({
  nombre: "el descuento de `import type` funciona (0 ficheros leen sectores/monografico como VALOR)",
  ok: falsosTipo.length === 0,
  visto: falsosTipo.length ? falsosTipo.join(", ") : "0 ficheros — concuerda con PLAN-FASE-3 §F3-5",
});
// y su simetrico: el descuento no puede comerse TODO (si no, el censo sale a 0)
const conValor = [...importsDe.values()].filter((e) => e.libs.size).length;
controles.push({
  nombre: "el descuento no se come todos los imports (queda >0 lectura de valor)",
  ok: conValor > 0,
  visto: `${conValor} ficheros importan algun modulo de contenido como VALOR`,
});

// ── 4 · LAS TRES UNIDADES ────────────────────────────────────────────────────
const conDirecto = filas.filter((f) => f.directo.length);
const conTrans = filas.filter((f) => f.transitivo.length);

// El transitivo a secas sale PLENO (25 de 26) y por tanto no discrimina: nav y
// footer son el CASCARON y los alcanza todo el mundo — §*un patron que casa en
// TODAS tampoco mide nada*. El cascaron se DERIVA (modulo alcanzado por >=90 %
// de las pages), no se escribe a mano (§regla 9, 7.º caso).
const alcancePorModulo = new Map();
for (const f of filas) for (const m of f.transitivo) alcancePorModulo.set(m, (alcancePorModulo.get(m) ?? 0) + 1);
const UMBRAL = Math.ceil(filas.length * 0.9);
const cascaron = [...alcancePorModulo.entries()].filter(([, n]) => n >= UMBRAL).map(([m]) => m).sort();
for (const f of filas) f.propio = f.transitivo.filter((m) => !cascaron.includes(m));
const conPropio = filas.filter((f) => f.propio.length);

controles.push({
  nombre: "el cascaron derivado no se come el censo (0 < |cascaron| < |contenido|)",
  ok: cascaron.length > 0 && cascaron.length < contenido.size,
  visto: `cascaron=${cascaron.length} contenido=${contenido.size}`,
});
controles.push({
  nombre: "la lectura PROPIO discrimina (no es pleno ni cero)",
  ok: conPropio.length > 0 && conPropio.length < filas.length,
  visto: `${conPropio.length} de ${filas.length}`,
});

const salida = {
  meta: {
    tanda: "123.ª · PASO 0",
    fecha: new Date().toISOString().slice(0, 10),
    pregunta: "¿qué page.tsx leen CONTENIDO de src/lib, y en qué unidad se cuenta?",
    noContesta: [
      "el RÉGIMEN de cada arquetipo (se deriva del <body> capturado, no del árbol)",
      "si el corpus tiene la captura (se deriva de corpus/, no de src/)",
      "cuántas INSTANCIAS existe de cada arquetipo en el original",
    ],
  },
  controles,
  unidadA_MODULO: {
    definicion: "ficheros de src/lib clasificados CONTENIDO (exportan >=1 constante de datos)",
    n: contenido.size,
    total: modulos.length,
    lista: [...contenido].sort(),
    descartados: modulos.filter((m) => !m.esContenido).map((m) => `${m.modulo} (fn=${m.nFuncs} tipos=${m.nTipos})`),
  },
  unidadB_PAGE: {
    definicion: "page.tsx que ALCANZAN un modulo de contenido",
    directo: { definicion: "import @/lib/x en el propio page.tsx", n: conDirecto.length },
    transitivo: {
      definicion: "page.tsx -> componentes -> @/lib/x",
      n: conTrans.length,
      aviso: "PLENO: no discrimina, el cascaron lo alcanza todo",
    },
    propio: {
      definicion: "transitivo MENOS el cascaron derivado",
      n: conPropio.length,
      cascaronDerivado: cascaron,
      umbral: `alcanzado por >= ${UMBRAL} de ${filas.length} pages`,
    },
    totalPages: filas.length,
  },
  filas: filas.sort((a, b) => b.transitivo.length - a.transitivo.length),
};

const nulo = controles.some((c) => !c.ok);
salida.meta.veredicto = nulo ? "NULA — control en rojo" : "valida";

const dest = "docs/research/cola-larga/derivaciones/censo-lib-123.json";
writeFileSync(dest, JSON.stringify(salida, null, 2) + "\n", "utf8");

console.log("=== CONTROLES ===");
for (const c of controles) console.log(`  ${c.ok ? "OK " : "RED"} ${c.nombre} :: ${c.visto}`);
console.log("");
console.log("=== LAS TRES UNIDADES (la C se deriva del build, aparte) ===");
console.log(`  A · MODULO de contenido       : ${contenido.size} de ${modulos.length} ficheros de src/lib`);
console.log(`  B · PAGE (import DIRECTO)     : ${conDirecto.length} de ${filas.length} page.tsx`);
console.log(`  B · PAGE (alcance TRANSITIVO) : ${conTrans.length} de ${filas.length} page.tsx  <- PLENO, no discrimina`);
console.log(`  B · PAGE (contenido PROPIO)   : ${conPropio.length} de ${filas.length} page.tsx`);
console.log(`      cascaron derivado         : ${cascaron.join(", ")} (alcanzado por >= ${UMBRAL}/${filas.length})`);
console.log("");
console.log("=== PAGES, por nº de modulos de contenido alcanzados ===");
for (const f of salida.filas.slice().sort((a, b) => b.propio.length - a.propio.length)) {
  if (!f.propio.length) continue;
  console.log(`  ${f.propio.length.toString().padStart(2)} ${f.ruta.padEnd(42)} ${f.dinamica ? "DIN " : "fija"} :: ${f.propio.join(", ")}`);
}
console.log("");
console.log("=== PAGES SIN contenido propio de lib (ya leen de la DB) ===");
for (const f of salida.filas) if (!f.propio.length) console.log(`     ${f.ruta}`);
console.log("");
console.log(`congelado: ${dest}`);
if (nulo) {
  console.log("VEREDICTO: NULA — control en rojo");
  process.exit(1);
}
console.log("VEREDICTO: valida");
