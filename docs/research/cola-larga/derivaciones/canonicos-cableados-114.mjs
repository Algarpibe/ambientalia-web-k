/**
 * DERIVACIÓN · ¿cuántos consumidores CABLEAN un canónico de `medidas/`?
 * (114.ª tanda, PASO 0)
 *
 * Pre-registro: docs/research/cola-larga/derivaciones/PRE-REGISTRO-CANONICOS-CABLEADOS-114.md
 *
 * UNIDAD = LA LECTURA, no el fichero (§0.3 del pre-registro). `catalogos.mjs`
 * cablea 7 veces con UNA guarda; `lh-cubos.mjs` resuelve un insumo y cablea
 * otro. Contar ficheros absorbe la membresía — §*un cardinal es un contenedor*.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠ ESTA ES LA v3, Y EL CAMBIO ES DE INSTRUMENTO: SE PARSEA, NO SE LEXA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Las dos versiones anteriores llevaban un lexer escrito a mano para saltarse
 * los comentarios, y le salieron DOS defectos, cada uno invisible a la guarda
 * del anterior:
 *
 *   v1 · no reconocía REGEX LITERALES. Un `/['"]/` abre una comilla que nunca
 *        cierra, y a partir de ahí se lee CÓDIGO como cadena y CADENA como
 *        código. Medido: **38 de 264 fuentes (14.4 %)** terminaban con una
 *        cadena abierta. No daba error: daba números plausibles.
 *
 *   v2 · arreglado eso, quedaba el caso peor: `coloca-media.mjs` se
 *        desincronizaba EN MEDIO y se volvía a sincronizar antes del final, o
 *        sea **dos errores que se anulan** — así que la guarda de «termina
 *        abierto» no podía verlo, y el fichero publicaba un comentario como
 *        código. Es §*un Δ de cero puede ser dos errores que se anulan*
 *        cometido DENTRO del instrumento.
 *
 * Arreglar el segundo con otra heurística habría sido §regla 4 —*la instancia y
 * no la CLASE*— por tercera vez. La clase es **que un lexer a mano no es un
 * parser**, y el repo ya trae uno: `acorn`. Con el AST, «esto es un comentario»
 * y «esto es el primer argumento de `w()`» dejan de ser heurísticas y pasan a
 * ser hechos del árbol.
 *
 * TRES EJES ORTOGONALES:
 *
 *   eje A · ¿ESCRITURA o CONSUMO?  primer argumento de `w()`, directo o por
 *                                  variable → escritura, fuera del universo
 *   eje B · ¿CABLEADO o RESUELTO?  resuelto = la inicialización toca una
 *                                  variable que viene de eligeCongeladaAnterior
 *                                  o readdirSync
 *   eje C · ¿tiene GUARDA?         directa (`if (!existsSync(X)) throw`) ·
 *                                  por helper que guarda · por bucle de tabla
 *
 *   CABLEA  = A ∧ B          ← el punto 1 del encargo
 *   DEFECTO = A ∧ B ∧ ¬C     ← el punto 3: «cablea» no es «defecto»
 *
 * EXCLUSIONES, cada una con su cardinal (§regla 14):
 *   · scripts/qa/.tmp/ — bundles de esbuild, llevan el fuente DENTRO, así que un
 *     grep ingenuo cuenta la misma lectura dos veces. No trackeados (.gitignore L56).
 *   · literales en PROSA — `"corpus/… + medidas/lh-spec-{…}.json"` es un campo de
 *     metadatos, no una ruta. Discriminador: el resto del string lleva espacios.
 *   · .json fuera de `medidas/` — la 110.ª midió que sobre-casarlo lleva a 12/13.
 *
 * GUARDA DEL DETECTOR (§sondas 4): ejes A y B a CERO o al PLENO salen POR ERROR
 * nombrado. Un cero y un pleno se leen los dos como dato — y el pleno del eje B
 * (`RESUELVE 0 de 86`) es justo lo que delató a la v1.
 *
 * CONTROL POR LOS DOS LADOS (§regla 8), conocido de antemano:
 *   positivo · f33-spec.mjs ×2 y catalogos.mjs ×7 → 9 CABLEA,
 *              f33-spec `f33-rutas.json` SIN guarda, catalogos ×7 CON guarda
 *   negativo · lh-cubos.mjs L132 (lh-cmp-<ancho>-todas) → RESUELVE, no CABLEA
 *
 * Uso:  node canonicos-cableados-114.mjs
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..", "..", "..");
const SCRIPTS = join(RAIZ, "scripts");
const MED = join(RAIZ, "scripts", "qa", "medidas");
const acorn = createRequire(join(RAIZ, "package.json"))("acorn");

/* ─────────────────────────────────────────────────────────────────────────
   1 · UNIVERSO DE FUENTES — con `.tmp/` excluido y CONTADO
   ───────────────────────────────────────────────────────────────────────── */

const fuentes = [];
const excluidosTmp = [];

(function recorre(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === "medidas") continue;
      if (e.name === ".tmp") { for (const t of readdirSync(p)) if (t.endsWith(".mjs")) excluidosTmp.push(t); continue; }
      recorre(p);
    } else if (e.name.endsWith(".mjs")) fuentes.push(p);
  }
})(SCRIPTS);

/* ─────────────────────────────────────────────────────────────────────────
   2 · WALKER genérico del AST (con cadena de ancestros)
   ───────────────────────────────────────────────────────────────────────── */

function anda(nodo, visita, pila = []) {
  if (!nodo || typeof nodo.type !== "string") return;
  visita(nodo, pila);
  pila.push(nodo);
  for (const k of Object.keys(nodo)) {
    if (k === "type" || k === "start" || k === "end" || k === "loc") continue;
    const v = nodo[k];
    if (Array.isArray(v)) { for (const x of v) if (x && typeof x.type === "string") anda(x, visita, pila); }
    else if (v && typeof v.type === "string") anda(v, visita, pila);
  }
  pila.pop();
}

const nombres = (nodo) => { const s = new Set(); anda(nodo, (n) => { if (n.type === "Identifier") s.add(n.name); }); return s; };
const llama = (nodo, fn) => { let r = false; anda(nodo, (n) => { if (n.type === "CallExpression" && ((n.callee.type === "Identifier" && n.callee.name === fn) || (n.callee.type === "MemberExpression" && n.callee.property?.name === fn))) r = true; }); return r; };

/* texto de un literal o template, con `${}` donde haya interpolación */
function textoDe(n) {
  if (n.type === "Literal") return typeof n.value === "string" ? n.value : null;
  if (n.type === "TemplateLiteral") return n.quasis.map((q, i) => q.value.cooked + (i < n.expressions.length ? "${}" : "")).join("");
  return null;
}

/* ─────────────────────────────────────────────────────────────────────────
   3 · CLASIFICACIÓN, fichero a fichero
   ───────────────────────────────────────────────────────────────────────── */

const RE_TOKEN = /medidas\/[^\s"'`,)]+\.json/;
const consumos = [];
const noAnalizables = [];
const metadatos = [];          // nombran un fichero y no lo lee nadie (§regla 14: con su cardinal)
let nEscrituras = 0, nProsa = 0;

const LECTORAS = new Set(["readFileSync", "readFile", "existsSync", "createReadStream", "statSync"]);
const esLectora = (nd) => nd?.type === "CallExpression" && LECTORAS.has(nd.callee.type === "Identifier" ? nd.callee.name : nd.callee.property?.name);

for (const f of fuentes) {
  const rel = relative(RAIZ, f).replace(/\\/g, "/");
  const src = readFileSync(f, "utf8");
  let ast;
  try { ast = acorn.parse(src, { ecmaVersion: "latest", sourceType: "module", locations: true }); }
  catch (e) { noAnalizables.push({ fichero: rel, motivo: `acorn: ${e.message.slice(0, 60)}` }); continue; }

  /* 3a · variables RESUELTAS (eje B) y variables ESCRITAS con w() (eje A) --- */
  const resueltas = new Set(), escritas = new Set(), helpersGuardan = new Set(), helpersLeen = new Set();
  let hayLectora = false;
  anda(ast, (n) => { if (esLectora(n)) hayLectora = true; });
  anda(ast, (n) => {
    if (n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.init) {
      if (llama(n.init, "eligeCongeladaAnterior") || llama(n.init, "readdirSync")) resueltas.add(n.id.name);
    }
    if (n.type === "CallExpression" && n.callee.type === "Identifier" && n.callee.name === "w" && n.arguments[0]?.type === "Identifier")
      escritas.add(n.arguments[0].name);
    /* helper local que guarda: su cuerpo tiene existsSync y throw/exit */
    if (n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.init &&
        (n.init.type === "ArrowFunctionExpression" || n.init.type === "FunctionExpression")) {
      if (llama(n.init, "existsSync") && (llama(n.init, "exit") || tieneThrow(n.init))) helpersGuardan.add(n.id.name);
      if (llama(n.init, "readFileSync") || llama(n.init, "existsSync")) helpersLeen.add(n.id.name);
    }
    if (n.type === "FunctionDeclaration" && n.id && llama(n, "existsSync") && (llama(n, "exit") || tieneThrow(n))) helpersGuardan.add(n.id.name);
    if (n.type === "FunctionDeclaration" && n.id && (llama(n, "readFileSync") || llama(n, "existsSync"))) helpersLeen.add(n.id.name);
  });

  /* 3b · GUARDAS directas: if (!existsSync(<...>)) { throw | exit } --------- */
  const guardadas = new Set();          // identificadores protegidos por una guarda
  let hayGuardaSuelta = false;          // la forma `catalogos.mjs`: guarda dentro del bucle
  anda(ast, (n) => {
    if (n.type !== "IfStatement") return;
    /*  la negación NO tiene por qué ser la raíz del test: `seed-listados.mjs` la
        escribe como `if (!existsSync(F) || SABOTAJE === "…")`. Exigirla en la
        raíz es §*la causa común* con el nivel puesto en el AST — se busca en
        todo el test.                                                          */
    let neg = null;
    anda(n.test, (t) => { if (!neg && t.type === "UnaryExpression" && t.operator === "!" && llama(t.argument, "existsSync")) neg = t.argument; });
    if (!neg) return;
    if (!(tieneThrow(n.consequent) || llama(n.consequent, "exit"))) return;
    hayGuardaSuelta = true;
    for (const id of nombres(neg)) guardadas.add(id);
  });

  /* 3b-bis · el nombre puede llegar por `join(RAIZ, "…/medidas", VAR)`, que es
     la forma de `f33-spec` L470-471. El literal no dice `medidas/`: lo dice el
     `join`. Se resuelve VAR a su declaración literal.                        */
  const porJoin = new Map();   // nodo Identifier → texto reconstruido
  anda(ast, (n) => {
    if (n.type !== "CallExpression") return;
    const cal = n.callee.type === "Identifier" ? n.callee.name : n.callee.property?.name;
    if (cal !== "join") return;
    const iMed = n.arguments.findIndex((a) => a.type === "Literal" && typeof a.value === "string" && /(^|\/)medidas$/.test(a.value));
    if (iMed < 0) return;
    const sig = n.arguments[iMed + 1];
    if (!sig) return;
    if (sig.type === "Identifier") {
      let lit = null;
      anda(ast, (m) => { if (m.type === "VariableDeclarator" && m.id.name === sig.name && m.init) { const t = textoDe(m.init); if (t) lit = t; } });
      porJoin.set(sig, lit ? `medidas/${lit}` : `medidas/\${${sig.name}}`);
    } else { const t = textoDe(sig); if (t) porJoin.set(sig, `medidas/${t}`); }
  });

  /* 3c · los literales que nombran un fichero de `medidas/` ---------------- */
  const local = [];
  anda(ast, (n, pila) => {
    if (n.type !== "Literal" && n.type !== "TemplateLiteral" && !porJoin.has(n)) return;
    const bruto = porJoin.get(n) ?? textoDe(n);
    if (!bruto || !/medidas\//.test(bruto)) return;
    const tok = RE_TOKEN.exec(bruto);
    if (!tok) return;
    if (/\s/.test(bruto.replace(tok[0], ""))) { nProsa++; return; }   // PROSA

    const padre = pila[pila.length - 1];
    const linea = n.loc.start.line;

    /* ── eje A · ESCRITURA es lo que hay que PROBAR ───────────────────────── */
    /*  el literal puede no ser el argumento DIRECTO: `sondeo.mjs` escribe
        `w(SABOTAJE ? \`…-neg-\${S}.json\` : "…-frontera.json", informe)`, así que
        `arguments[0]` es el ternario. Se sube por los nodos TRANSPARENTES
        —ternario, `||`/`&&`— hasta ver si el destino es `w(…)`.               */
    let sub = n, k = pila.length - 1;
    while (k >= 0 && (pila[k].type === "ConditionalExpression" || pila[k].type === "LogicalExpression")) { sub = pila[k]; k--; }
    const arriba = pila[k];
    if (arriba?.type === "CallExpression" && arriba.callee.type === "Identifier" && arriba.callee.name === "w" && arriba.arguments[0] === sub) { nEscrituras++; return; }

    /*  ⚠ Y «no es escritura» NO basta para que sea consumo: este repo escribe
        METADATOS con nombres de fichero dentro —`fuente: ["medidas/kb-spec-1440.json",
        "medidas/kb-spec-390.json"]` en `extractor-kb.mjs:704`— que no lee nadie.
        Son la misma clase que los literales en PROSA, pero sin espacios que los
        delaten, así que el filtro de prosa no los ve.

        Un CONSUMO tiene que LLEGAR a una lectura: directamente, por su variable,
        o por un helper. Lo que no llega es METADATO y se publica con su cardinal
        (§regla 14), nunca se descuenta en silencio.                            */
    //  variable de la sentencia: el VariableDeclarator más cercano hacia arriba
    const decl = [...pila].reverse().find((p) => p.type === "VariableDeclarator" && p.id.type === "Identifier");
    const esPropiedad = padre?.type === "Property" && padre.value === n;
    const v = esPropiedad ? null : decl?.id.name ?? null;

    let llega = pila.some(esLectora);                                  // readFileSync(join(…, "medidas/x.json"))
    if (!llega && v) anda(ast, (m) => { if (esLectora(m) && nombres(m).has(v)) llega = true; });
    if (!llega && v) for (const h of [...helpersLeen, ...helpersGuardan]) { let u = false; anda(ast, (m) => { if (m.type === "CallExpression" && (m.callee.name === h) && m.arguments.some((a) => a.type === "Identifier" && a.name === v)) u = true; }); if (u) { llega = true; break; } }
    if (!llega && padre?.type === "CallExpression") { const cal = padre.callee.type === "Identifier" ? padre.callee.name : padre.callee.property?.name; if (cal && (helpersLeen.has(cal) || helpersGuardan.has(cal))) llega = true; }
    if (!llega && esPropiedad && hayLectora) llega = true;              // tabla consumida por un bucle
    if (!llega) { metadatos.push({ fichero: rel, linea: n.loc.start.line, texto: tok[0] }); return; }
    if (v && escritas.has(v)) { nEscrituras++; return; }

    /* ── eje B · CABLEA vs RESUELVE ──────────────────────────────────────── */
    //  la inicialización COMPLETA de la sentencia — así `arg("cmp", auto ? … : …)`
    //  cuenta como RESUELVE por el `_autoCmp` de su ternario (lh-cubos L132)
    const ambito = decl?.init ?? padre;
    let resuelve = false, viaB = "literal escrito a mano";
    if (ambito) {
      if (llama(ambito, "eligeCongeladaAnterior") || llama(ambito, "readdirSync")) { resuelve = true; viaB = "eligeCongeladaAnterior/readdirSync en la expresión"; }
      else for (const r of resueltas) if (nombres(ambito).has(r)) { resuelve = true; viaB = `variable resuelta \`${r}\``; break; }
    }

    /* ── eje C · GUARDA ──────────────────────────────────────────────────── */
    let guarda = false, viaC = "—";
    if (v && guardadas.has(v)) { guarda = true; viaC = `directa sobre \`${v}\``; }
    //  el literal pasado DIRECTO a un helper que guarda: `corridaVigente("medidas/x.json")`
    if (!guarda && padre?.type === "CallExpression") {
      const cal = padre.callee.type === "Identifier" ? padre.callee.name : padre.callee.property?.name;
      if (cal && helpersGuardan.has(cal)) { guarda = true; viaC = `helper \`${cal}()\``; }
    }
    if (!guarda && v) {
      for (const h of helpersGuardan) {
        let usa = false;
        anda(ast, (m) => { if (m.type === "CallExpression" && m.callee.type === "Identifier" && m.callee.name === h && m.arguments.some((a) => a.type === "Identifier" && a.name === v)) usa = true; });
        if (usa) { guarda = true; viaC = `helper \`${h}()\``; break; }
      }
    }
    //  forma TABLA (`catalogos.mjs`): el literal es el valor de una propiedad y
    //  quien guarda es el bucle que la consume, UNA sola vez para las 7.
    if (!guarda && esPropiedad && hayGuardaSuelta) { guarda = true; viaC = "bucle de tabla"; }

    const dinamico = /\$\{\}/.test(tok[0]);
    const enDisco = dinamico ? null : existsSync(join(MED, tok[0].replace(/^.*medidas\//, "")));
    local.push({ fichero: rel, linea, texto: tok[0], cablea: !resuelve, viaB, guarda, viaC, dinamico, enDisco });
  });
  consumos.push(...local);
}

function tieneThrow(n) { let r = false; anda(n, (x) => { if (x.type === "ThrowStatement") r = true; }); return r; }

/* ─────────────────────────────────────────────────────────────────────────
   4 · GUARDA DEL DETECTOR (§sondas 4) — ni cero ni pleno, en LOS DOS EJES
   ───────────────────────────────────────────────────────────────────────── */

const cablea = consumos.filter((c) => c.cablea);
const resueltos = consumos.length - cablea.length;
const fallos = [];
if (!consumos.length) fallos.push("EJE A A CERO: 0 consumos. Un selector que no casa con nada no es un cero.");
if (!nEscrituras) fallos.push("EJE A SIN ESCRITURAS: si nada sale como `w()`, el eje no discrimina.");
if (!resueltos) fallos.push("EJE B AL PLENO: 0 RESUELVE. Es lo que delató a la v1 — un patrón que casa en todas no mide nada.");
if (!cablea.length) fallos.push("EJE B AL CERO: 0 CABLEA.");
if (noAnalizables.length) fallos.push(`PARSER: ${noAnalizables.length} fuentes no parsean. El universo no está cubierto.`);

/* ─────────────────────────────────────────────────────────────────────────
   5 · CONTROL POR LOS DOS LADOS, conocido de antemano
   ───────────────────────────────────────────────────────────────────────── */

const de = (f) => consumos.filter((c) => c.fichero.endsWith(f));
const spec = de("qa/f33-spec.mjs").filter((c) => c.cablea);
const cat = de("seed/catalogos.mjs").filter((c) => c.cablea);
const specRutas = spec.find((c) => /f33-rutas/.test(c.texto));
const cubosCmp = de("qa/lh-cubos.mjs").filter((c) => /lh-cmp-/.test(c.texto));

const ctrl = [
  { lado: "+", caso: "f33-spec.mjs CABLEA ×2", esp: 2, obt: spec.length, ok: spec.length === 2 },
  { lado: "+", caso: "catalogos.mjs CABLEA ×7", esp: 7, obt: cat.length, ok: cat.length === 7 },
  { lado: "+", caso: "f33-spec `f33-rutas.json` SIN guarda", esp: "sin guarda", obt: specRutas ? (specRutas.guarda ? `guarda: ${specRutas.viaC}` : "sin guarda") : "NO SALE", ok: !!specRutas && !specRutas.guarda },
  { lado: "+", caso: "catalogos.mjs CON guarda ×7", esp: 7, obt: cat.filter((c) => c.guarda).length, ok: cat.filter((c) => c.guarda).length === 7 },
  { lado: "−", caso: "lh-cubos `lh-cmp-…-todas` RESUELVE", esp: "resuelve", obt: cubosCmp.length ? cubosCmp.map((c) => `L${c.linea} ${c.cablea ? "CABLEA" : "RESUELVE"}`).join(" · ") : "NO SALE", ok: cubosCmp.length > 0 && cubosCmp.every((c) => !c.cablea) },
  /*  control negativo nuevo, conocido de antemano: `extractor-kb.mjs:704` es
      `fuente: ["medidas/kb-spec-1440.json", "medidas/kb-spec-390.json"]`, o sea
      METADATO de un informe. Ninguna de las dos la lee nadie.                 */
  { lado: "−", caso: "extractor-kb `kb-spec-*` son METADATO, no consumo", esp: "0 consumos · 2 metadatos",
    obt: `${de("seed/extractor-kb.mjs").filter((c) => /kb-spec/.test(c.texto)).length} consumos · ${metadatos.filter((m) => /kb-spec/.test(m.texto) && m.fichero.endsWith("seed/extractor-kb.mjs")).length} metadatos`,
    ok: de("seed/extractor-kb.mjs").filter((c) => /kb-spec/.test(c.texto)).length === 0 && metadatos.filter((m) => /kb-spec/.test(m.texto) && m.fichero.endsWith("seed/extractor-kb.mjs")).length === 2 },
];

/* ─────────────────────────────────────────────────────────────────────────
   6 · ACOTACIÓN a la cadena que la campaña de red va a usar (punto 4)
   ───────────────────────────────────────────────────────────────────────── */

const pkg = JSON.parse(readFileSync(join(RAIZ, "package.json"), "utf8")).scripts || {};
const CADENA_RE = /^(cms:captura|cms:coloca-media$|qa:media-canales$|cms:seed|seed)/;
const basesCadena = new Set(); const comandosCadena = [];
for (const [n, cmd] of Object.entries(pkg)) {
  if (!CADENA_RE.test(n)) continue;
  comandosCadena.push(n);
  for (const m of cmd.matchAll(/([\w./-]+\.mjs)/g)) basesCadena.add(m[1].split("/").pop());
}
const enCadena = (c) => basesCadena.has(c.fichero.split("/").pop()) || /^scripts\/seed\//.test(c.fichero);

/* ─────────────────────────────────────────────────────────────────────────
   7 · INFORME
   ───────────────────────────────────────────────────────────────────────── */

const defecto = cablea.filter((c) => !c.guarda);
const acot = cablea.filter(enCadena);
const acotDef = acot.filter((c) => !c.guarda);

/*  ⚠ LA ACOTADA TIENE DOS UNIDADES Y NO SE SUSTITUYE UNA POR OTRA
    (§*corregir un denominador no es sustituirlo en todas partes*).
    Un `.neg.mjs` NO lo ejecuta ninguna campaña de red: lo ejecuta `qa:*-neg`, y
    cablea la congelada de su sonda o su propia fixtura A PROPÓSITO — a veces una
    que DEBE faltar (`esta-lista-no-existe.json`). Meterlos en el veredicto es
    §regla 25: una guarda cuyo dominio es más ancho que su invariante deja de
    proteger y pasa a BLOQUEAR.                                               */
const acotDefNeg = acotDef.filter((c) => /\.neg\.mjs$/.test(c.fichero));
const acotDefProd = acotDef.filter((c) => !/\.neg\.mjs$/.test(c.fichero));

/*  P7 · los negativos NOMBRAN SU PROPIA AUSENCIA a propósito; que falten es lo
    que su caso prueba. El discriminador es el marcador de §regla 7, no un criterio. */
const RE_AUSENCIA = /NO-EXISTE|no-existe|-neg-|SABOTAJE|^medidas\/(x|trampa)\.json$/;
const muertosBrutos = cablea.filter((c) => c.enDisco === false);
const ausenciaQuerida = muertosBrutos.filter((c) => RE_AUSENCIA.test(c.texto) || /\.test\.mjs$|\.neg\.mjs$/.test(c.fichero));
const muertos = muertosBrutos.filter((c) => !ausenciaQuerida.includes(c));
const dinamicos = consumos.filter((c) => c.dinamico);
const ficherosDef = new Set(defecto.map((c) => c.fichero));

const P = (n) => String(n).padStart(4);
console.log(`\n════════ CANÓNICOS CABLEADOS · 114.ª PASO 0 (v3 · AST) ════════\n`);
console.log(`  EXCLUIDO  scripts/qa/.tmp/ .............. ${P(excluidosTmp.length)} .mjs (bundles, .gitignore L56)`);
console.log(`  universo  fuentes .mjs .................. ${P(fuentes.length)}`);
console.log(`  PARSER    no parsean (excluidas) ........ ${P(noAnalizables.length)}`);
console.log(`  eje A     ESCRITURAS (w) descartadas .... ${P(nEscrituras)}`);
console.log(`  eje A     CONSUMOS de medidas/ .......... ${P(consumos.length)}   ← P1`);
console.log(`  eje B     CABLEA ........................ ${P(cablea.length)}   ← P2`);
console.log(`            RESUELVE ...................... ${P(resueltos)}`);
console.log(`  eje C     DEFECTO (cablea sin guarda) ... ${P(defecto.length)}   ← P3`);
console.log(`            ficheros con ≥1 defecto ....... ${P(ficherosDef.size)}   ← P6`);
console.log(`  ACOTADO   CABLEA en la cadena ........... ${P(acot.length)}   ← P4`);
console.log(`            de ésos, SIN GUARDA ........... ${P(acotDef.length)}   ← P5 (unidad CADENA COMPLETA)`);
console.log(`              · en .neg.mjs (fixtura propia) ${P(acotDefNeg.length)}   NO lo ejecuta ninguna campaña de red`);
console.log(`              · en PRODUCCIÓN ............. ${P(acotDefProd.length)}   ← P5 (unidad CAMINO DE PRODUCCIÓN)`);
console.log(`  disco     cableados que NO resuelven .... ${P(muertos.length)}   ← P7`);
console.log(`            de ausencia QUERIDA (excluidos) ${P(ausenciaQuerida.length)}   (negativos y fixtures: que falten es lo que prueban)`);
console.log(`            dinámicos (no comprobables) ... ${P(dinamicos.length)}`);
console.log(`  EXCLUIDO  literales en PROSA ............ ${P(nProsa)}   (frases con espacios)`);
console.log(`  EXCLUIDO  METADATO (no lo lee nadie) .... ${P(metadatos.length)}   (campos \`fuente:\`, \`canales:\` — nombran sin leer)`);
console.log(`\n  cadena acotada = ${comandosCadena.length} comandos de package.json · ${basesCadena.size} ficheros nombrados + scripts/seed/`);

console.log(`\n──────── CONTROL POR LOS DOS LADOS ────────`);
for (const c of ctrl) console.log(`  ${c.ok ? "✓" : "✗"} [${c.lado}] ${c.caso}: esperado ${c.esp}, obtenido ${c.obt}`);

console.log(`\n──────── LA CADENA ACOTADA · PRODUCCIÓN (lo que se arregla) ────────`);
console.log(`  ⚠ FALSO POSITIVO CONOCIDO — verificado a mano el 2026-08-26, NO se vuelve a mirar:`);
console.log(`    coloca-media.mjs:84 sale PELADA y NO lo está. Su guarda vive a DOS SALTOS de`);
console.log(`    variable —L146 \`const LISTA = corridaVigente(LISTA_PEDIDA)\` y L148 \`if (!existsSync`);
console.log(`    (FUENTE)) throw\`— y este detector sólo sigue UNO. Además L84 es el default de un`);
console.log(`    parámetro (\`LISTA=\`), que §regla 5bis declara legítimo: el parámetro elige la`);
console.log(`    DEFINICIÓN, y la CORRIDA la resuelve corridaVigente() por mtime. Está bien.`);
for (const c of acot.filter((x) => !/\.neg\.mjs$/.test(x.fichero)).sort((a, b) => a.fichero.localeCompare(b.fichero) || a.linea - b.linea))
  console.log(`  ${c.guarda ? "guarda " : "PELADA "} ${c.fichero}:${c.linea}  ${c.texto}${c.guarda ? `   [${c.viaC}]` : ""}${c.enDisco === false ? "   ⚠ NO EN DISCO" : ""}`);

console.log(`\n──────── LA CADENA ACOTADA · .neg.mjs (fixtura propia, NO se arregla) ────────`);
for (const c of acot.filter((x) => /\.neg\.mjs$/.test(x.fichero)).sort((a, b) => a.fichero.localeCompare(b.fichero) || a.linea - b.linea))
  console.log(`  ${c.guarda ? "guarda " : "PELADA "} ${c.fichero}:${c.linea}  ${c.texto}`);

if (muertos.length) {
  console.log(`\n──────── LECTORES MUERTOS (cablean algo que hoy NO existe) ────────`);
  for (const c of muertos) console.log(`  ${c.guarda ? "guarda " : "PELADA "} ${c.fichero}:${c.linea}  ${c.texto}`);
}

console.log(`\n──────── DEFECTOS FUERA DE LA CADENA (se fichan, NO se arreglan) ────────`);
const fuera = defecto.filter((c) => !enCadena(c));
const fueraF = [...new Set(fuera.map((c) => c.fichero))].sort();
console.log(`  ${fueraF.length} ficheros · ${fuera.length} lecturas`);
for (const f of fueraF) console.log(`    ${f}  (${fuera.filter((c) => c.fichero === f).length})`);

if (noAnalizables.length) { console.log(`\n──────── NO PARSEAN ────────`); for (const n of noAnalizables) console.log(`  ${n.fichero}   [${n.motivo}]`); }
const ok = ctrl.every((c) => c.ok) && !fallos.length;
if (fallos.length) { console.log(`\n❌ GUARDA DEL DETECTOR:`); for (const f of fallos) console.log(`   ${f}`); }
console.log(`\n${ok ? "✅" : "❌"} control ${ctrl.filter((c) => c.ok).length}/${ctrl.length} · evaluadas ${consumos.length} consumos / ${fuentes.length} fuentes\n`);

process.exit(ok ? 0 : 1);
