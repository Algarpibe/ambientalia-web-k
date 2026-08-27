/**
 * LA MATRIZ DE COMPARADORES · ¿QUÉ MIDE CONTRA EL ORIGINAL, Y SOBRE QUÉ?
 * Uso: node docs/research/cola-larga/derivaciones/matriz-comparadores-120.mjs
 *      (offline: lee fuentes y congeladas, no levanta nada)
 *
 * ── Por qué se deriva por MECANISMO y no por nombre ─────────────────────────
 *
 * El encargo habla de «24 comandos `qa:*cmp*`». Filtrar por el literal `cmp`
 * es §sondas 4 esperando a pasar: un comparador que no se llame así **no sale**,
 * y su ausencia se lee como que no existe. Aquí el conjunto se deriva
 * recorriendo TODAS las sondas y preguntando por su MECANISMO:
 *
 *   ¿de dónde saca el lado del ORIGINAL?  corpus (`file://`) · espejo congelado
 *                                          · kunakair.com VIVO · de ninguno
 *   ¿de dónde saca el lado del CLON?       `iniciarClon()` / `next start` / CLON
 *
 * **Sólo es comparador de fidelidad quien tiene LOS DOS.** Una sonda con un solo
 * lado puede ser utilísima —una guarda de regresión, un censo— y **no mide
 * fidelidad**: compara el clon con el clon de ayer, y ayer podía estar mal.
 *
 * ⚠ El recuento por comando y el recuento por SONDA no coinciden (variantes
 * `-390`, `--vivo`, `--todas`), así que se publican los dos con su unidad
 * —§*cada denominador se escribe CON SU UNIDAD*—.
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("../../../../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const QA = join(RAIZ, "scripts/qa");
const MED = join(QA, "medidas");
const yaMarcado = (n) => /-neg-|SABOTAJE|SONDA-/.test(n);

/* ── 1 · el universo: TODAS las sondas, no las que se llamen «cmp» ── */
const LIBRERIAS = new Set(["lib.mjs", "lib.test.mjs", "css-compilado.mjs", "lh-barrido.mjs", "lh-ejes.mjs"]);
const sondas = readdirSync(QA)
  .filter((n) => n.endsWith(".mjs") && !n.endsWith(".neg.mjs") && !LIBRERIAS.has(n));

/* ── 2 · el mecanismo de cada lado, leído del fuente sin comentarios ── */
const sinComentarios = (t) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/*
 * ⚠ MENCIONAR EL ORIGINAL NO ES PEDIRLO — y la v1 de este detector lo confundió.
 *
 * `enlaces.mjs` declara `const DOMINIO = "kunakair.com"` para CLASIFICAR hrefs y
 * su único `fetch` va al CLON: los dos lados son el clon, como ya estableció la
 * 119.ª. Con el dominio a secas salía «comparador de fidelidad», que es el
 * veredicto contrario al verdadero — §sondas 4 en su tercera cara, el
 * heurístico que sobre-casa y publica un número plausible de más.
 *
 * El discriminador es el **PROTOCOLO**: una constante de clasificación lleva el
 * dominio pelado; una petición lleva `https://`. Se controla contra dos casos
 * conocidos de antemano (abajo, CONTROL_VIVO).
 */
const LADO_ORIG = [
  [/corpus\/|CORPUS|file:\/\//, "corpus"],
  [/espejo|ESPEJO/, "espejo"],
  [/https:\/\/kunakair\.com/, "vivo"],
];
const RE_CLON = /iniciarClon|localhost:3000|127\.0\.0\.1:|process\.env\.CLON|\bCLON\b/;

/** Casos conocidos ANTES de mirar: si el detector falla aquí, no vale nada. */
const CONTROL_VIVO = { "barra-cmp.mjs": true, "mono-cmp.mjs": true, "enlaces.mjs": false };

const filas = [];
for (const n of sondas) {
  const t = sinComentarios(readFileSync(join(QA, n), "utf8"));
  const orig = LADO_ORIG.filter(([re]) => re.test(t)).map(([, k]) => k);
  const clon = RE_CLON.test(t);
  filas.push({ sonda: n, orig, clon, dosLados: orig.length > 0 && clon });
}

/* ── 3 · control cero/pleno: el detector tiene que discriminar ── */
const conOrig = filas.filter((f) => f.orig.length).length;
const conClon = filas.filter((f) => f.clon).length;
const dos = filas.filter((f) => f.dosLados);
console.log(`\n═══ CONTROL DEL DETECTOR\n`);
console.log(`  sondas auditadas ............... ${filas.length}`);
console.log(`  con lado ORIGINAL .............. ${conOrig}`);
console.log(`  con lado CLON .................. ${conClon}`);
console.log(`  con LOS DOS (comparadores) ..... ${dos.length}`);
if (conOrig === 0 || conOrig === filas.length || dos.length === 0) {
  console.error(`\n❌ el detector no discrimina (0 o pleno): corrida NULA.`);
  process.exitCode = 1;
}

/* ── control contra casos conocidos de antemano (§sondas 4) ── */
let malos = 0;
for (const [s, esperado] of Object.entries(CONTROL_VIVO)) {
  const f = filas.find((x) => x.sonda === s);
  const obtenido = !!f?.orig.includes("vivo");
  const ok = obtenido === esperado;
  if (!ok) malos++;
  console.log(`  control · ${s.padEnd(18)} vivo=${String(obtenido).padEnd(5)} esperado=${String(esperado).padEnd(5)} ${ok ? "✓" : "✗"}`);
}
if (malos) {
  console.error(`\n❌ ${malos} control(es) fallan: el detector no distingue MENCIONAR de PEDIR. Corrida NULA.`);
  process.exitCode = 1;
}

/* ── 4 · qué comparó de verdad: se lee de su CONGELADA, no del fuente ── */
const congeladas = readdirSync(MED).filter((n) => n.endsWith(".json") && !yaMarcado(n));
const basePorSonda = (s) => s.replace(/\.mjs$/, "");

function ultimaCongelada(base) {
  const cands = congeladas.filter((n) => n === `${base}.json` || n.startsWith(`${base}-`));
  if (!cands.length) return null;
  // por mtime, nunca por nombre (§regla 5: el canónico es la PRIMERA foto)
  return cands
    .map((n) => ({ n, m: statSync(join(MED, n)).mtimeMs }))
    .sort((a, b) => b.m - a.m)[0];
}

function unidades(o) {
  const m = o?.meta || {};
  for (const k of ["rutas", "paginas", "formas", "instancias", "pares", "modulos", "filas"])
    if (typeof m[k] === "number") return { unidad: k, n: m[k] };
  for (const k of Object.keys(o || {}))
    if (Array.isArray(o[k]) && o[k].length) return { unidad: k, n: o[k].length };
  return { unidad: "?", n: null };
}

console.log(`\n═══ LOS COMPARADORES DE DOS LADOS, CON LO QUE COMPARARON\n`);
console.log(`  sonda                     lado ORIGINAL   congelada más reciente                  unidad         n`);
const detalle = [];
for (const f of dos.sort((a, b) => a.sonda.localeCompare(b.sonda))) {
  const base = basePorSonda(f.sonda);
  const c = ultimaCongelada(base);
  let u = { unidad: "—", n: null };
  if (c) { try { u = unidades(JSON.parse(readFileSync(join(MED, c.n), "utf8"))); } catch { /* ilegible */ } }
  console.log(
    "  " + base.padEnd(26) + f.orig.join("+").padEnd(16) +
      (c ? c.n : "— SIN CONGELADA —").padEnd(40) + String(u.unidad).padEnd(14) + String(u.n ?? "·").padStart(6),
  );
  detalle.push({ sonda: base, ladoOriginal: f.orig, congelada: c?.n ?? null, ...u });
}

/* ── 5 · los de UN SOLO lado: guardas de regresión, NO fidelidad ── */
const soloClon = filas.filter((f) => f.clon && !f.orig.length);
console.log(`\n═══ SOLO-CLON — miden regresión, NO fidelidad (${soloClon.length})\n`);
console.log("  " + soloClon.map((f) => basePorSonda(f.sonda)).join(" · "));

/* ── 6 · el recuento por COMANDO, que es otra unidad ── */
const scripts = JSON.parse(readFileSync(join(RAIZ, "package.json"), "utf8")).scripts;
const cmds = Object.keys(scripts).filter((k) => /cmp/i.test(k));
const cmdsDeDos = cmds.filter((k) => dos.some((f) => scripts[k].includes(f.sonda)));
console.log(`\n═══ LAS DOS UNIDADES DEL RECUENTO\n`);
console.log(`  comandos \`qa:*cmp*\` ................... ${cmds.length}`);
console.log(`  de ellos, que llaman a un comparador .. ${cmdsDeDos.length}`);
console.log(`  SONDAS comparadoras distintas ......... ${dos.length}`);
console.log(`  (la diferencia son variantes -390/--vivo/--todas y los .neg)`);

writeFileSync(
  new URL("./matriz-comparadores-120.json", import.meta.url),
  JSON.stringify(
    {
      meta: { fecha: "2026-08-27", tanda: "120.ª ESCALÓN 2", sondasAuditadas: filas.length },
      control: { conLadoOriginal: conOrig, conLadoClon: conClon, comparadores: dos.length },
      recuento: { comandosCmp: cmds.length, comandosDeComparador: cmdsDeDos.length, sondasComparadoras: dos.length },
      comparadores: detalle,
      soloClon: soloClon.map((f) => basePorSonda(f.sonda)),
    },
    null,
    1,
  ),
  "utf8",
);
console.log(`\n→ derivaciones/matriz-comparadores-120.json`);
