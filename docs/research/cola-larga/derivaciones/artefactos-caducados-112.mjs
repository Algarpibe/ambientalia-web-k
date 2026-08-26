/**
 * DERIVACIÓN · ¿cuántos artefactos de §regla 7 se congelaron con su instrumento
 * a medio completar? (112.ª tanda, PASO 0)
 *
 * Pre-registro: docs/research/cola-larga/derivaciones/PRE-REGISTRO-ARTEFACTOS-CADUCADOS-112.md
 *
 * DOS EJES ORTOGONALES, porque el encargo pide las dos direcciones y una sola
 * magnitud no puede darlas:
 *
 *   eje A · TEMPORAL     ¿el artefacto es anterior al último cambio de su
 *                        instrumento?  → CANDIDATO
 *   eje B · ESTRUCTURAL  ¿la forma (claves de primer nivel) difiere de la del
 *                        canónico de su base?  → evidencia de CADUCIDAD
 *
 *   CADUCADO      = A y B
 *   SOBRE-CASADO  = A sin B   ← dirección (b) del encargo
 *   SIN CLASIFICAR= A y sin canónico con qué comparar
 *
 * MAGNITUD: la fecha del ÚLTIMO COMMIT del fichero, no su mtime. Razón en §0.4
 * del pre-registro: git no guarda mtime, así que un control replayado a un
 * commit anterior saldría VACÍO POR CONSTRUCCIÓN. mtime se conserva como
 * SEGUNDO INSTRUMENTO para cruzar (§sondas 4) y su desacuerdo se publica.
 *
 * Uso:  node artefactos-caducados-112.mjs [rev]
 *       rev por defecto HEAD. El control positivo se corre a 31a2aa0.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..", "..", "..");
const MED = join(RAIZ, "scripts", "qa", "medidas");
const QA = join(RAIZ, "scripts", "qa");

const REV = process.argv[2] || "HEAD";
const HIST = REV === "HEAD";

const git = (...a) =>
  execFileSync("git", ["-C", RAIZ, ...a], { encoding: "utf8", maxBuffer: 1 << 30 });

/* ─────────────────────────────────────────────────────────────────────────
   1 · UNIVERSO — marcadores de §regla 7, y CADUCADA FUERA
   `CADUCADA` es el renombre de §regla 5bis, o sea el RESULTADO de este censo
   y no su entrada. Contarlo metería los 4 que la 111.ª ya resolvió y el censo
   saldría confirmando su propio trabajo previo (§0.2 del pre-registro).
   ───────────────────────────────────────────────────────────────────────── */
const MARCADOR = /-neg-|-neg\.|-SABOTAJE|-SONDA-/;

function ficherosEn(rev) {
  if (rev === "HEAD") return readdirSync(MED).filter((f) => f.endsWith(".json"));
  return git("ls-tree", "--name-only", rev, "scripts/qa/medidas/")
    .split("\n")
    .filter(Boolean)
    .map((p) => p.split("/").pop())
    .filter((f) => f.endsWith(".json"));
}

const TODOS = ficherosEn(REV);
const conMarcador = TODOS.filter((f) => MARCADOR.test(f));
const universo = conMarcador.filter((f) => !f.includes("CADUCADA"));
const yaCaducadas = conMarcador.filter((f) => f.includes("CADUCADA"));

/* ─────────────────────────────────────────────────────────────────────────
   2 · MAPEO base → instrumento.
   El instrumento son DOS ficheros (§0.3): `<base>.mjs` la produce y
   `<base>.neg.mjs` la sabotea. La fecha es el MÁXIMO de las dos — tomar sólo
   la sonda es un dominio más estrecho que el invariante (§regla 25).
   GUARDA §sondas 4: una base que no resuelva sale POR ERROR NOMBRADO, nunca
   descontada en silencio. Un mapeo que se come artefactos produce el mismo
   cero que «no hay caducados».
   ───────────────────────────────────────────────────────────────────────── */
/** Los instrumentos NO viven sólo en `scripts/qa/`: `scripts/seed/` tiene los
 *  suyos. Buscarlos sólo en `qa` es un dominio más estrecho que el invariante
 *  (§regla 25) y produce «sin mapear» que son del instrumento, no del repo. */
function mjsRecursivo(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === ".tmp" || e.name === "node_modules") continue; // bundles generados
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...mjsRecursivo(p));
    else if (e.name.endsWith(".mjs")) out.push(p);
  }
  return out;
}
const TODOS_MJS = mjsRecursivo(join(RAIZ, "scripts"));
const relQA = (p) => p.slice(RAIZ.length + 1).replace(/\\/g, "/");

const SONDAS = new Map(); // base → [rutas relativas]
for (const p of TODOS_MJS) {
  const base = p
    .split(/[\\/]/)
    .pop()
    .replace(/\.neg\.mjs$/, "")
    .replace(/\.mjs$/, "");
  if (!SONDAS.has(base)) SONDAS.set(base, []);
  SONDAS.get(base).push(relQA(p));
}

/** NIVEL 2 · quién ESCRIBE el canónico `medidas/<nombre>.json`.
 *  Hace falta porque el nombre del artefacto no siempre es el de su sonda:
 *  `a-extraido.json` lo escribe `extractor-a.mjs`. El prefijo no puede
 *  resolver eso ni estrechándolo ni alargándolo — hay que leer el fuente. */
const ESCRIBE = new Map(); // nombre canónico sin .json → [rutas]
for (const p of TODOS_MJS) {
  let txt;
  try {
    txt = readFileSync(p, "latin1");
  } catch {
    continue;
  }
  // ⚠ LEER el canónico NO es PRODUCIRLO. `catalogos.mjs` menciona
  // `medidas/a-extraido.json` para consumirlo; el productor es `extractor-a.mjs`,
  // que lo escribe con `w(...)`. Contar al lector infla la fecha del
  // instrumento y fabrica caducados — §regla 36 con el objeto cambiado:
  // aparecer en el selector no es ser su sujeto.
  for (const linea of txt.split("\n")) {
    if (!/\bw\(/.test(linea) && !/SALIDA/.test(linea)) continue;
    for (const m of linea.matchAll(/medidas\/([A-Za-z0-9._-]+)\.json/g)) {
      const n = m[1];
      if (!ESCRIBE.has(n)) ESCRIBE.set(n, []);
      const r = relQA(p);
      if (!ESCRIBE.get(n).includes(r)) ESCRIBE.get(n).push(r);
    }
  }
}

const prefijoDe = (f) => {
  const m = MARCADOR.exec(f);
  return f.slice(0, m.index);
};

/** Prefijo más LARGO que resuelva. Longest-match: nunca sube de `a-extraido`
 *  a `a` mientras `a-extraido` resuelva. Dos niveles, en orden:
 *    1 · el prefijo ES el nombre de un `.mjs`            (`kb-barra` → kb-barra.mjs)
 *    2 · algún `.mjs` ESCRIBE `medidas/<prefijo>.json`   (`a-extraido` → extractor-a.mjs)
 *  Lo que no resuelva por ninguno sale NOMBRADO (§sondas 4), nunca restado. */
function instrumentoDe(prefijo) {
  for (const nivel of [1, 2]) {
    let p = prefijo;
    while (p.length) {
      if (nivel === 1 && SONDAS.has(p)) return { base: p, rutas: SONDAS.get(p), via: "nombre" };
      if (nivel === 2 && ESCRIBE.has(p)) {
        // el productor y, con él, TODOS los ficheros que comparten su base
        // (`extractor-a.mjs` + `extractor-a.neg.mjs`): §0.3, el instrumento son dos
        const rutas = new Set(ESCRIBE.get(p));
        for (const r of ESCRIBE.get(p)) {
          const b = r.split("/").pop().replace(/\.neg\.mjs$/, "").replace(/\.mjs$/, "");
          for (const x of SONDAS.get(b) || []) rutas.add(x);
        }
        return { base: p, rutas: [...rutas], via: "escribe" };
      }
      const i = p.lastIndexOf("-");
      if (i < 0) break;
      p = p.slice(0, i);
    }
  }
  return null;
}

/* ─────────────────────────────────────────────────────────────────────────
   3 · FECHAS por commit — UNA sola pasada de `git log`, no N llamadas.
   ───────────────────────────────────────────────────────────────────────── */
const fechaCommit = new Map(); // ruta → ISO del commit más reciente que la tocó
{
  const log = git("log", REV, "--format=%x00%cI", "--name-only");
  let actual = null;
  for (const linea of log.split("\n")) {
    if (linea.startsWith("\0")) {
      actual = linea.slice(1);
      continue;
    }
    const r = linea.trim();
    if (!r || !actual) continue;
    if (!fechaCommit.has(r)) fechaCommit.set(r, actual); // log es del más nuevo al más viejo
  }
}
const fechaDe = (rutaRel) => fechaCommit.get(rutaRel) || null;

/* ─────────────────────────────────────────────────────────────────────────
   4 · EJE B — claves de primer nivel SIN `JSON.parse`.
   320 MB en `medidas/`; un parse completo asigna el árbol entero para leer
   sólo la primera capa. Barrido lineal con profundidad y estado de cadena.
   ───────────────────────────────────────────────────────────────────────── */
function clavesDePrimerNivel(texto) {
  const claves = [];
  let prof = 0,
    enCadena = false,
    escape = false,
    ini = -1;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (enCadena) {
      if (escape) escape = false;
      else if (c === "\\") escape = true;
      else if (c === '"') {
        enCadena = false;
        if (prof === 1 && ini >= 0) {
          // ¿es clave? lo dice el primer no-espacio que sigue
          let j = i + 1;
          while (j < texto.length && /\s/.test(texto[j])) j++;
          if (texto[j] === ":") claves.push(texto.slice(ini, i));
        }
      }
      continue;
    }
    if (c === '"') {
      enCadena = true;
      escape = false;
      ini = i + 1;
    } else if (c === "{" || c === "[") prof++;
    else if (c === "}" || c === "]") prof--;
  }
  return claves;
}

function leer(f) {
  if (REV === "HEAD") {
    const p = join(MED, f);
    return existsSync(p) ? readFileSync(p, "utf8") : null;
  }
  try {
    return git("show", `${REV}:scripts/qa/medidas/${f}`);
  } catch {
    return null;
  }
}

/* ── EJE C · INERCIA ────────────────────────────────────────────────────────
   El encargo lo pide explícitamente: «anterior» no es «caducado» — sólo lo es
   si el cambio del instrumento tocó LO QUE EL ARTEFACTO MIDE. Un cambio de
   comentario o de mensaje no caduca nada, y §regla 37 ya lo midió como NO-OP.

   Se clasifica INERTE sólo si TODAS las líneas cambiadas del instrumento entre
   la fecha del artefacto y la del instrumento son comentario o vacío. El sesgo
   es CONSERVADOR a propósito: ante la duda NO se declara inerte, porque el
   defecto se pone en la dirección que grita (§sondas 6).
   ─────────────────────────────────────────────────────────────────────────── */
const esComentarioOVacio = (l) => /^\s*$/.test(l) || /^\s*(\/\/|\*|\/\*|\*\/)/.test(l);

const cacheInercia = new Map();
function inerteDesde(ruta, fArt) {
  const k = `${ruta} ${fArt}`;
  if (cacheInercia.has(k)) return cacheInercia.get(k);
  let v = null;
  try {
    const log = git("log", REV, "--format=%H %cI", "--", ruta)
      .split("\n")
      .filter(Boolean)
      .map((l) => l.split(" "));
    const posteriores = log.filter(([, d]) => d > fArt);
    if (!posteriores.length) v = true; // nada cambió después: inerte por definición
    else {
      const masViejo = posteriores[posteriores.length - 1][0];
      const diff = git("diff", `${masViejo}^..${REV}`, "--unified=0", "--", ruta);
      const cambiadas = diff
        .split("\n")
        .filter((l) => /^[+-]/.test(l) && !/^(\+\+\+|---)/.test(l))
        .map((l) => l.slice(1));
      v = cambiadas.length > 0 && cambiadas.every(esComentarioOVacio);
    }
  } catch {
    v = null; // no se pudo derivar: SIN CLASIFICAR, nunca «inerte»
  }
  cacheInercia.set(k, v);
  return v;
}

const cacheClaves = new Map();
function firmaDe(f) {
  if (cacheClaves.has(f)) return cacheClaves.get(f);
  const t = leer(f);
  const v = t === null ? null : clavesDePrimerNivel(t).sort().join("|");
  cacheClaves.set(f, v);
  return v;
}

/* ─────────────────────────────────────────────────────────────────────────
   5 · CENSO
   ───────────────────────────────────────────────────────────────────────── */
const setTodos = new Set(TODOS);
const filas = [];
const sinMapear = [];

for (const f of universo) {
  const prefijo = prefijoDe(f);
  const inst = instrumentoDe(prefijo);
  if (!inst) {
    sinMapear.push({ f, prefijo, hayCanonico: setTodos.has(`${prefijo}.json`) });
    continue;
  }
  const { base, rutas, via } = inst;

  const fechas = rutas.map((r) => [r, fechaDe(r)]).filter(([, d]) => d);
  fechas.sort((a, b) => (a[1] < b[1] ? -1 : 1));
  const ultimo = fechas[fechas.length - 1] || [null, null];
  const fInstr = ultimo[1];
  const instrDe = ultimo[0];
  const fArt = fechaDe(`scripts/qa/medidas/${f}`);

  const candidato = fArt && fInstr ? fArt < fInstr : null;

  // eje B — canónico = el prefijo antes del marcador, sin marcador
  const canonico = `${prefijo}.json`;
  const hayCanonico = setTodos.has(canonico);
  let divergente = null;
  if (candidato && hayCanonico) {
    const a = firmaDe(f);
    const b = firmaDe(canonico);
    divergente = a !== null && b !== null ? a !== b : null;
  }

  // eje C — ¿el cambio del instrumento tocó código, o sólo comentario?
  const inerte = candidato ? inerteDesde(instrDe, fArt) : null;

  filas.push({
    f,
    base,
    canonico: hayCanonico ? canonico : null,
    fArt,
    fInstr,
    instrDe,
    via,
    candidato,
    divergente,
    inerte,
  });
}

/* cruce con el SEGUNDO instrumento (mtime) — sólo a HEAD, que es donde existe */
let desacuerdoMtime = 0,
  cruzados = 0;
if (HIST) {
  for (const r of filas) {
    if (!r.fArt) continue;
    const p = join(MED, r.f);
    if (!existsSync(p)) continue;
    cruzados++;
    const mt = statSync(p).mtime.toISOString().slice(0, 10);
    if (mt !== r.fArt.slice(0, 10)) desacuerdoMtime++;
  }
}

const candidatos = filas.filter((r) => r.candidato === true);
const caducados = candidatos.filter((r) => r.divergente === true);
const sobrecasados = candidatos.filter((r) => r.divergente === false);
const sinClasificar = candidatos.filter((r) => r.divergente === null);
const alDia = filas.filter((r) => r.candidato === false);
const sinFecha = filas.filter((r) => r.candidato === null);

/* ─────────────────────────────────────────────────────────────────────────
   6 · INFORME — un solo canal de verdad (§sondas 1): lo que se imprime es lo
   que se cuenta, y los ceros salen NOMBRADOS con su denominador.
   ───────────────────────────────────────────────────────────────────────── */
const P = (...a) => console.log(...a);

P(`=== CENSO DE ARTEFACTOS CADUCADOS · rev=${REV} ===\n`);
P(`congeladas totales                 ${TODOS.length}`);
P(`con marcador de §regla 7           ${conMarcador.length}`);
P(`  − ya renombradas CADUCADA        ${yaCaducadas.length}   (§regla 5bis: resultado, no entrada)`);
P(`UNIVERSO                           ${universo.length}\n`);

P(`SIN MAPEAR (ningún .mjs resuelve)  ${sinMapear.length}   ← §sondas 4: fallo nombrado, NO resta`);
{
  const conCanon = sinMapear.filter((x) => x.hayCanonico);
  P(`    con canónico en medidas/       ${conCanon.length}   (existe la medida; falta su productor)`);
  P(`    sin canónico tampoco           ${sinMapear.length - conCanon.length}`);
  const pref = [...new Set(sinMapear.map((x) => x.prefijo))].sort();
  P(`    prefijos distintos             ${pref.length}: ${pref.join(" · ")}`);
}
P("");

P(`mapeados                           ${filas.length}`);
{
  const porVia = new Map();
  for (const r of filas) porVia.set(r.via, (porVia.get(r.via) || 0) + 1);
  for (const [v, n] of porVia) P(`    vía ${v.padEnd(8)}                   ${n}`);
}
P(`  sin fecha de commit              ${sinFecha.length}`);
P(`  AL DÍA (no candidatos)           ${alDia.length}`);
P(`  CANDIDATOS (eje A)               ${candidatos.length}`);
P(`    ├─ CADUCADOS      (A y B)      ${caducados.length}   ← evidencia estructural`);
P(`    ├─ SOBRE-CASADOS  (A sin B)    ${sobrecasados.length}`);
P(`    └─ SIN CLASIFICAR (sin canón.) ${sinClasificar.length}\n`);

/* eje C · ¿el cambio del instrumento fue INERTE? — dirección (b) del encargo */
const inertes = candidatos.filter((r) => r.inerte === true);
const conCodigo = candidatos.filter((r) => r.inerte === false);
const inerteNS = candidatos.filter((r) => r.inerte === null);
P(`  eje C · INERCIA del cambio (sobre los ${candidatos.length} candidatos)`);
P(`    INERTE  (sólo comentario/vacío)  ${inertes.length}   ← el eje A los marcó DE MÁS`);
P(`    tocó CÓDIGO                      ${conCodigo.length}`);
P(`    no derivable                     ${inerteNS.length}\n`);

const caducadosFirmes = caducados.filter((r) => r.inerte === false);
const sinProbar = candidatos.filter((r) => !(r.divergente === true) && r.inerte !== true);
/* ── LA CORRECCIÓN DE LA DIRECCIÓN (b), Y ES LA GRANDE ──────────────────────
   `SONDA-<DEFECTO>` no es la congelada de un negativo: es EVIDENCIA de un
   defecto que la sonda TUVO (§regla 7). Su contenido reproduce el
   comportamiento VIEJO a propósito, así que diverge del canónico POR
   CONSTRUCCIÓN y el eje B la marca siempre. Re-congelarla no la arreglaría:
   BORRARÍA LA PRUEBA, que es justo lo que §regla 5 existe para impedir.
   O sea que el eje B tiene 0 instancias separadoras sobre esta clase.
   ─────────────────────────────────────────────────────────────────────────── */
const esEvidencia = (f) => /-SONDA-|-SABOTAJE/.test(f);
const cadEvidencia = caducados.filter((r) => esEvidencia(r.f));
const cadNegativo = caducados.filter((r) => !esEvidencia(r.f));
P(`  clase del marcador, sobre los ${caducados.length} caducados`);
P(`    SONDA-/SABOTAJE (evidencia)      ${cadEvidencia.length}   ← NO se re-congelan: borraría la prueba`);
P(`    -neg- (congelada de negativo)    ${cadNegativo.length}   ← ÉSTA es la deuda real\n`);

P(`  VEREDICTO`);
const firmeDeuda = caducadosFirmes.filter((r) => !esEvidencia(r.f));
const firmeEvid = caducadosFirmes.filter((r) => esEvidencia(r.f));
P(`    CADUCADO FIRME (A · B · código)  ${caducadosFirmes.length}`);
P(`      de ésos, DEUDA REAL (-neg-)    ${firmeDeuda.length}   ← hay que re-congelar`);
P(`      de ésos, evidencia (SONDA-)    ${firmeEvid.length}   ← se dejan como están`);
// §sondas 1 · lo que se imprime y lo que se cuenta no pueden discrepar.
// La primera versión imprimía 11 + 0 = 26 porque `filter(esEvidencia)` recibía
// el OBJETO en vez de `r.f`, y el regex daba false sobre "[object Object]".
// No dio error: dio un cero plausible. Lo cazó la ARITMÉTICA, así que la
// aritmética se queda puesta como guarda en vez de como atención.
if (firmeDeuda.length + firmeEvid.length !== caducadosFirmes.length) {
  console.error(
    `\n✗ DESCUADRE: ${firmeDeuda.length} + ${firmeEvid.length} ≠ ${caducadosFirmes.length}`,
  );
  process.exitCode = 1;
}
P(`    caducado con cambio inerte       ${caducados.length - caducadosFirmes.length}`);
P(`    NO caducado (cambio inerte)      ${inertes.length}`);
P(`    SIN PROBAR sin correrlo          ${sinProbar.length}   (§regla 14: limitación CON su número)\n`);

if (HIST) {
  P(`cruce 2.º instrumento (mtime)      ${cruzados} cruzados · ${desacuerdoMtime} en desacuerdo\n`);
}

/* ── LIMITACIÓN DECLARADA CON SU NÚMERO (§regla 14) ─────────────────────────
   El censo atribuye a cada artefacto SÓLO `<base>.mjs` y `<base>.neg.mjs`.
   `lib.mjs` es el instrumento de TODAS —`Evaluadas`, `w()`, `Censo`,
   `gritaSiRevienta`, `openPage`— y no entra en la atribución. Si entrara, todo
   artefacto anterior a su último cambio sería candidato. El número va aquí
   porque una limitación sin cardinal se lee como una nota al pie. */
{
  const fLib = fechaDe("scripts/qa/lib.mjs");
  const antesDeLib = fLib ? filas.filter((r) => r.fArt && r.fArt < fLib).length : null;
  P(`── LIMITACIÓN · lib.mjs NO entra en la atribución ──`);
  P(`   último cambio de scripts/qa/lib.mjs   ${fLib ? fLib.slice(0, 10) : "(sin fecha)"}`);
  P(`   artefactos ANTERIORES a él            ${antesDeLib} de ${filas.length}`);
  P(`   → si lib.mjs contara, ése sería el suelo de candidatos, no ${candidatos.length}\n`);
}

P(`── CADUCADOS, nombrados con sus dos lados ──`);
if (!caducados.length) P("   (ninguno)");
for (const r of caducados) {
  P(`   ${r.f}`);
  P(`      artefacto ${r.fArt.slice(0, 10)}  <  instrumento ${r.fInstr.slice(0, 10)} (${r.instrDe})`);
}
P("");

P(`── reparto de CANDIDATOS por base (top 15) ──`);
const porBase = new Map();
for (const r of candidatos) porBase.set(r.base, (porBase.get(r.base) || 0) + 1);
for (const [b, n] of [...porBase].sort((x, y) => y[1] - x[1]).slice(0, 15)) P(`   ${String(n).padStart(3)}  ${b}`);
P("");

/* ── CONTROL por los dos lados (§regla 8) ── */
const KB = universo.filter((f) => f.startsWith("kb-barra-1440-neg-"));
P(`── CONTROL · los 4 de kb-barra ──`);
P(`   presentes en el universo: ${KB.length}`);
for (const f of KB) {
  const r = filas.find((x) => x.f === f);
  P(
    `   ${f}\n      candidato=${r?.candidato}  divergente=${r?.divergente}  art=${r?.fArt?.slice(0, 10)}  instr=${r?.fInstr?.slice(0, 10)}`,
  );
}
const kbCad = KB.filter((f) => caducados.some((r) => r.f === f)).length;
P(`   → CADUCADOS de los 4: ${kbCad}`);
P(
  REV === "HEAD"
    ? `   ESPERADO a HEAD: 0 de 4 (se re-congelaron en 8622a38)  ${kbCad === 0 ? "✓" : "✗"}`
    : `   ESPERADO a ${REV}: 4 de 4  ${kbCad === 4 ? "✓" : "✗"}`,
);
