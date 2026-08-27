/**
 * CENSO DE F3-5 · qué arquetipos siguen leyendo su contenido de `src/lib/`
 * (119.ª, 2026-08-27) — RE-DERIVADO, no citado.
 *
 * ── Por qué se re-deriva en vez de citarse ────────────────────────────────
 * El alcance lo fijó el propietario en la 81.ª y el inventario de entonces era
 * **5 rutas · 4 arquetipos + 1 variante**. Las tandas 113–118 han tocado
 * `src/`, así que el conjunto **pudo moverse** — y un conjunto enumerado a mano
 * envejece **contra** el repo, en silencio (§regla 9, 7.º caso). Si sigue
 * siendo 5, eso también es un resultado y se escribe.
 *
 * ── El criterio, y su parte difícil ───────────────────────────────────────
 * «un `page.tsx` que importa un módulo de CONTENIDO de `src/lib/`, **no sólo
 * tipos ni helpers**». «Contenido» no es una propiedad del nombre del fichero,
 * así que se DERIVA de lo que se exporta:
 *
 *   CONTENIDO : `export const X = [` / `= {` con literales de cadena largos
 *               dentro — el texto de negocio;
 *   HELPER    : `export function X` o `export const X = (…) =>`;
 *   TIPOS     : `export type` / `export interface`.
 *
 * ⚠⚠ **Y SE CLASIFICA EL SÍMBOLO IMPORTADO, NO EL MÓDULO. La v1 clasificaba
 * el módulo y daba la respuesta al revés.**
 *
 * > **Un módulo puede ser CONTENIDO y la página importarle sólo un HELPER.**
 * > `lib/casos.ts` contiene el catálogo de casos —CONTENIDO sin discusión— y
 * > `casos-de-exito/[slug]/page.tsx` le importa `{ metadataDeCaso, prefijoDe }`,
 * > que son **dos funciones**: su contenido lo lee de `lib/cms/casos`. Medido
 * > al módulo, esa página sale «lee de fichero» y **ya está migrada**.
 *
 * Es §*la causa común: el NIVEL al que se mide* con el contenedor puesto en el
 * MÓDULO: un fichero de 900 líneas absorbe la diferencia entre importar su
 * catálogo entero e importarle una función de dos líneas. Medido al módulo el
 * censo daba **9**; medido al símbolo, que es la unidad que la pregunta usa,
 * da otro número — y la diferencia son exactamente las páginas híbridas.
 *
 * Y como sigue siendo un heurístico, va con **control** (§regla 8): se aplica a
 * `src/lib/cms/**`, cuyo papel se conoce —lectura de Payload, o sea NO
 * contenido de fichero—, y a `utils.ts`, que es helper por definición. Si el
 * clasificador los marca CONTENIDO, no discrimina.
 *
 * ── Los DOS ejes que NO hay que confundir ─────────────────────────────────
 * Un `page.tsx` puede leer de `src/lib/*.ts` (fichero) **y** de `src/lib/cms/`
 * (Payload) a la vez — el cascarón migrado con el cuerpo sin migrar. Así que
 * se publican **los dos** y su cruce, no un único «migrado sí/no».
 *
 * ── Lo que este censo NO contesta (§regla 14) ─────────────────────────────
 *   · NO mide importaciones TRANSITIVAS por defecto — un `page.tsx` que no
 *     importa lib pero renderiza un componente que sí. Se derivan aparte y se
 *     publican con su cardinal, porque son un conjunto distinto;
 *   · NO decide ningún content type. El censo es lo que hace decidible la
 *     fase; tomarla antes de tenerlo es la lección más cara de esta etapa.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, resolve } from "node:path";

const AQUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(AQUI, "..", "..", "..", "..");
const WEB = join(REPO, "apps", "web");
const SRC = join(WEB, "src");
const LIB = join(SRC, "lib");
const APP = join(SRC, "app");

/* ── inventario de ficheros ───────────────────────────────────────────── */

function anda(dir, filtro, acc = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) anda(p, filtro, acc);
    else if (filtro(p)) acc.push(p);
  }
  return acc;
}

const PAGES = anda(APP, (p) => p.endsWith("page.tsx")).sort();
const rel = (p) => relative(SRC, p).replace(/\\/g, "/");

/* ── clasificador de módulo de `src/lib` ──────────────────────────────── */

const MODS = anda(LIB, (p) => /\.tsx?$/.test(p)).sort();

/** Clasifica CADA símbolo exportado del módulo. La unidad es el SÍMBOLO. */
function clasifica(p) {
  const s = readFileSync(p, "utf8");
  const esCms = rel(p).startsWith("lib/cms/");
  const simbolos = new Map();

  /* funciones declaradas */
  for (const m of s.matchAll(/^export (?:async )?function (\w+)/gm)) simbolos.set(m[1], "HELPER");
  /* tipos */
  for (const m of s.matchAll(/^export (?:type|interface) (\w+)/gm)) simbolos.set(m[1], "TIPOS");
  /* consts: el signo de la derecha decide */
  for (const m of s.matchAll(/^export const (\w+)(\s*:[^=]+)?=\s*([\s\S]{0,60})/gm)) {
    const [, nom, , cola] = m;
    if (/^(async\s*)?\(|^\w+\s*=>|^function\b/.test(cola.trim())) { simbolos.set(nom, "HELPER"); continue; }
    if (/^[[{]/.test(cola.trim())) {
      /* dato: ¿lleva texto de negocio dentro? */
      const i = s.indexOf(`export const ${nom}`);
      const trozo = s.slice(i, i + 6000);
      simbolos.set(nom, /["'`][^"'`\n]{12,}["'`]/.test(trozo) ? "CONTENIDO" : "DATO-CORTO");
      continue;
    }
    simbolos.set(nom, /["'`][^"'`\n]{12,}["'`]/.test(cola) ? "CONTENIDO" : "DATO-CORTO");
  }
  const n = (c) => [...simbolos.values()].filter((v) => v === c).length;
  return {
    rel: rel(p), esCms, simbolos,
    /* clase del MÓDULO — se conserva SÓLO para el control y el reparto; el
     * censo NO la usa para decidir (§el nivel al que se mide). */
    clase: n("CONTENIDO") ? "CONTENIDO" : n("HELPER") ? "HELPER" : "TIPOS",
  };
}

const CLASES = new Map();
for (const m of MODS) CLASES.set(rel(m), clasifica(m));

/* ── CONTROL del clasificador ─────────────────────────────────────────── */

const cms = [...CLASES.values()].filter((c) => c.esCms);
const cmsMalClasificados = cms.filter((c) => c.clase === "CONTENIDO");
const utils = CLASES.get("lib/utils.ts");
const ctrlCms = cmsMalClasificados.length === 0;
const ctrlUtils = utils && utils.clase !== "CONTENIDO";

/* ── qué importa cada page.tsx ────────────────────────────────────────── */

/** Devuelve `{spec, simbolos[]}` por import — el símbolo es la unidad. */
function importsDe(p) {
  const s = readFileSync(p, "utf8");
  const out = [];
  for (const m of s.matchAll(/import\s+(type\s+)?(?:\{([^}]*)\}|(\w+))?[^;]*?from\s+["']([^"']+)["']/g)) {
    const [, esTipo, llaves, defecto, crudo] = m;
    let e = crudo;
    if (e.startsWith("@/")) e = e.slice(2);
    else if (e.startsWith(".")) e = relative(SRC, resolve(dirname(p), e)).replace(/\\/g, "/");
    else continue;
    const simbolos = esTipo
      ? []
      : (llaves || defecto || "")
          .split(",")
          .map((x) => x.replace(/^\s*type\s+/, "").split(/\s+as\s+/)[0].trim())
          .filter(Boolean);
    out.push({ spec: e, simbolos });
  }
  return out;
}
const specsDe = (p) => importsDe(p).map((i) => i.spec);

/** ¿a qué fichero de `lib` resuelve un especificador? */
function resuelveLib(e) {
  if (!e.startsWith("lib/")) return null;
  for (const k of [`${e}.ts`, `${e}.tsx`, `${e}/index.ts`, e]) if (CLASES.has(k)) return k;
  return null;
}

/** Los SÍMBOLOS de CONTENIDO que un fichero importa de `src/lib` (sin cms). */
function contenidoImportado(p) {
  const hit = [];
  for (const { spec, simbolos } of importsDe(p)) {
    const k = resuelveLib(spec);
    if (!k || CLASES.get(k).esCms) continue;
    const mod = CLASES.get(k);
    for (const s of simbolos) if (mod.simbolos.get(s) === "CONTENIDO") hit.push(`${k}:${s}`);
  }
  return [...new Set(hit)];
}

const FILAS = [];
for (const p of PAGES) {
  const libs = specsDe(p).map(resuelveLib).filter(Boolean);
  const contenido = contenidoImportado(p);
  const desdeCms = [...new Set(libs.filter((k) => CLASES.get(k).esCms))];
  /* módulos de lib tocados de los que NO se importa ningún símbolo de contenido */
  const soloHelper = [...new Set(libs.filter((k) => !CLASES.get(k).esCms))]
    .filter((k) => !contenido.some((c) => c.startsWith(`${k}:`)));
  FILAS.push({ ruta: rel(p), contenido, desdeCms, otros: soloHelper });
}

/* ── transitivas: page.tsx → componente → lib de CONTENIDO ────────────── */

const COMPS = anda(join(SRC, "components"), (p) => /\.tsx?$/.test(p));
const libsDeComp = new Map();
for (const c of COMPS) {
  const hit = contenidoImportado(c);
  if (hit.length) libsDeComp.set(rel(c), hit);
}

const TRANS = [];
for (const p of PAGES) {
  const comps = specsDe(p).filter((e) => e.startsWith("components/"));
  const via = new Set();
  for (const c of comps)
    for (const k of [`${c}.tsx`, `${c}.ts`, `${c}/index.tsx`])
      if (libsDeComp.has(k)) libsDeComp.get(k).forEach((x) => via.add(x));
  const fila = FILAS.find((f) => f.ruta === rel(p));
  const nuevas = [...via].filter((x) => !fila.contenido.includes(x));
  if (nuevas.length) TRANS.push({ ruta: rel(p), nuevas: [...new Set(nuevas.map((x) => x.split(":")[0]))] });
}

/* ── salida ───────────────────────────────────────────────────────────── */

console.log("═".repeat(86));
console.log("CENSO DE F3-5 · qué arquetipos leen su contenido de `src/lib/` — 119.ª, 2026-08-27");
console.log("═".repeat(86));
console.log(`\nALCANCE : apps/web/src — ${PAGES.length} \`page.tsx\` · ${MODS.length} módulos en \`src/lib\``);
console.log(`UNIDAD  : el \`page.tsx\` (una entrada del App Router), NO la ruta emitida`);

console.log(`\n${"─".repeat(86)}\nCONTROL del clasificador de módulos (§regla 8)\n${"─".repeat(86)}`);
console.log(`  lib/cms/** NO debe salir CONTENIDO : ${ctrlCms ? "✓" : "✗"}  ${cms.length} módulos · ${cmsMalClasificados.length} mal`);
console.log(`  lib/utils.ts NO debe salir CONTENIDO: ${ctrlUtils ? "✓" : "✗"}  (${utils ? utils.clase : "no existe"})`);

const porClase = {};
for (const c of CLASES.values()) if (!c.esCms) porClase[c.clase] = (porClase[c.clase] || 0) + 1;
console.log(`\n  reparto de \`src/lib/*\` (sin cms): ` + Object.entries(porClase).map(([k, v]) => `${k} ${v}`).join(" · "));

console.log(`\n${"═".repeat(86)}\nEL CENSO — page.tsx que importan CONTENIDO de src/lib (import DIRECTO)\n${"═".repeat(86)}`);
const conContenido = FILAS.filter((f) => f.contenido.length);
for (const f of conContenido)
  console.log(`  ${f.ruta.padEnd(46)} ← ${f.contenido.join(" · ")}${f.desdeCms.length ? `   [+cms: ${f.desdeCms.length}]` : ""}`);
console.log(`\n  TOTAL: ${conContenido.length} de ${PAGES.length} page.tsx`);

console.log(`\n${"─".repeat(86)}\nLOS QUE YA LEEN DE PAYLOAD (lib/cms) y NO importan contenido de fichero\n${"─".repeat(86)}`);
const soloCms = FILAS.filter((f) => !f.contenido.length && f.desdeCms.length);
for (const f of soloCms) console.log(`  ${f.ruta}`);
console.log(`  n = ${soloCms.length}`);

console.log(`\n${"─".repeat(86)}\nNI LO UNO NI LO OTRO — se publican para que no se lean como clasificados\n${"─".repeat(86)}`);
const ninguno = FILAS.filter((f) => !f.contenido.length && !f.desdeCms.length);
if (!ninguno.length) console.log("  (ninguno)");
for (const f of ninguno) console.log(`  ${f.ruta.padEnd(46)} otros: ${f.otros.join(" · ") || "—"}`);
console.log(`  n = ${ninguno.length}`);

console.log(`\n${"═".repeat(86)}\nTRANSITIVAS — contenido que llega por un COMPONENTE, no por el page.tsx\n${"═".repeat(86)}`);
if (!TRANS.length) console.log("  (ninguna nueva)");
for (const t of TRANS) console.log(`  ${t.ruta.padEnd(46)} vía componente ← ${t.nuevas.join(" · ")}`);
console.log(`  n = ${TRANS.length}  ⚠ conjunto DISTINTO del de arriba: se publica aparte, no se suma`);

/* ── LA UNIÓN, que es el alcance real de F3-5 ──────────────────────────── */

const CASCARON = new Set(["lib/nav.ts", "lib/footer.ts"]);
const union = new Map();
for (const f of FILAS) {
  const dir = f.contenido.map((x) => x.split(":")[0]);
  const tr = (TRANS.find((t) => t.ruta === f.ruta) || { nuevas: [] }).nuevas;
  const todo = [...new Set([...dir, ...tr])];
  if (todo.length) union.set(f.ruta, todo);
}
const propio = new Map();
for (const [r, mods] of union) {
  const p = mods.filter((m) => !CASCARON.has(m));
  if (p.length) propio.set(r, p);
}

console.log(`\n${"═".repeat(86)}\nLA UNIÓN — page.tsx que leen ALGO de contenido de src/lib (directo O vía componente)\n${"═".repeat(86)}`);
for (const [r, mods] of union) console.log(`  ${r.padEnd(50)} ${mods.length} mód · ${mods.join(" · ")}`);
console.log(`\n  UNIÓN = ${union.size} de ${PAGES.length} page.tsx`);

console.log(`\n${"─".repeat(86)}\nY DESCOMPUESTO: fuera el CASCARÓN COMPARTIDO (lib/nav.ts · lib/footer.ts)\n${"─".repeat(86)}`);
console.log(`  El cascarón lo lee casi todo, así que sumado a la firma hace que todo`);
console.log(`  parezca una sola familia (§un total puede confundir DOS EJES).\n`);
for (const [r, mods] of propio) console.log(`  ${r.padEnd(50)} ${mods.join(" · ")}`);
const soloCascaron = [...union.keys()].filter((r) => !propio.has(r));
console.log(`\n  con contenido PROPIO de fichero : ${propio.size}`);
console.log(`  SÓLO el cascarón compartido     : ${soloCascaron.length}  ${soloCascaron.join(" · ") || "—"}`);

const suma = conContenido.length + soloCms.length + ninguno.length;
console.log(`\n  control de partición: ${conContenido.length} + ${soloCms.length} + ${ninguno.length} = ${suma} de ${PAGES.length}  ${suma === PAGES.length ? "✓" : "✗"}`);

if (!ctrlCms || !ctrlUtils || suma !== PAGES.length) {
  console.error("\n❌ UN CONTROL EN ROJO — el censo NO vale");
  process.exit(1);
}
console.log(`\n✓ evaluadas ${PAGES.length}/${PAGES.length} page.tsx · unidad: page.tsx`);
