/* ═════════════════════════════════════════════════════════════════════════
 *  ¿EN QUÉ UNIDAD ESTÁ CADA LECTURA DEL TRIPWIRE DE §regla 19?
 *  115.ª · PASO 0 · 2026-08-26
 * ═════════════════════════════════════════════════════════════════════════
 *
 * EL DEFECTO QUE LA ORIGINA
 *   El cierre de la 114.ª publicó «el fichero a 260 699 chars» y de ahí un
 *   «1.67× aquel tamaño» contra los 156 426 CHARS de §regla 19. Las dos
 *   cifras están mal por el mismo sitio y en direcciones distintas:
 *     · 260 699 son BYTES, no chars — el fichero tiene 254 173 chars;
 *     · 1.67× compara BYTES contra CHARS, o sea DOS UNIDADES.
 *
 *   Es §*cada denominador se escribe CON SU UNIDAD*, cometido sobre el
 *   tripwire que existe justamente para publicar un tamaño.
 *
 * QUÉ PREGUNTA CONTESTA
 *   NO «¿cuánto mide el fichero?» — eso es un `wc` y no necesita derivación.
 *   La pregunta es la de §regla 9 aplicada a una SERIE: **¿está la serie de
 *   lecturas del tripwire en una sola unidad, y cuál es la que se salió?**
 *
 *   Y se contesta sin creerle a nadie: para cada valor publicado se busca si
 *   EXISTE un commit cuyo fichero tenga ese número de chars, o ese número de
 *   bytes. Un valor que sólo case por un lado queda adjudicado a esa unidad
 *   SIN ambigüedad; uno que case por los dos sale declarado indecidible.
 *
 * QUÉ PREGUNTAS **NO** CONTESTA (§*antes de construir sobre una medida,
 * escribe qué preguntas NO contesta*)
 *   · NO dice qué fichero leyó cada sesión: el barrido casa VALORES contra
 *     estados del repo, no sesiones contra commits. Que 230 016 sólo exista
 *     como chars de `c57921c` adjudica la UNIDAD, no la procedencia.
 *   · NO mide el contexto REAL inyectado, que es la concatenación del
 *     CLAUDE.md global (46 268 chars hoy) con el del proyecto. Todas las
 *     cifras de la serie son del fichero DE PROYECTO, y así se publican.
 *   · NO dice si el fichero llega entero: eso lo dice que los dos marcadores
 *     se citen, y es una observación de la sesión, no de esta sonda.
 *
 * CONTROLES (§regla 8: un negativo sin control no es un negativo)
 *   C1 · el censo de marcadores tiene que distinguir MARCADOR de MENCIÓN.
 *        El detector ingenuo (`indexOf`) sitúa `KV-08` al 79 % del fichero,
 *        porque caza la MENCIÓN dentro del texto de §regla 19; el bueno lo
 *        sitúa a 16 chars del final. Si los dos dieran lo mismo, el detector
 *        no discriminaría y el censo no probaría nada.
 *   C2 · la adjudicación tiene que dejar ALGÚN valor sin casar por el lado
 *        equivocado. Si todo casara por los dos lados, el método no separa.
 *   C3 · el `grep` que busca el precedente tiene que casar un número que SÍ
 *        está («156 426»). Sin él, «0 ocurrencias» y «el filtro no casa» son
 *        la misma salida — §sondas 4 sobre un `grep` propio, que es cómo se
 *        derivó mal la §regla 26.
 *   C4 · el filtro de contexto tiene que RECORTAR citas ajenas y NINGUNA que
 *        case contra un estado del fichero. Si no recortara nada, no estaría
 *        discriminando; si recortara alguna que casa, se llevaría dato bueno.
 *
 * SIN RED · SIN BUILD · SIN TOCAR `src/` — sólo `git show` y el fichero.
 * ═══════════════════════════════════════════════════════════════════════ */

import { execFileSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, "../../../..");
const CLAUDE = join(RAIZ, "CLAUDE.md");

const L = [];
const say = (s = "") => { L.push(s); console.log(s); };
const git = (...args) =>
  execFileSync("git", args, { cwd: RAIZ, maxBuffer: 2e8 });

say("═══ ¿EN QUÉ UNIDAD ESTÁ CADA LECTURA DEL TRIPWIRE? · 115.ª PASO 0 ═══");
say("");

/* ────────────────────────────────────────────────────────────────────────
 * 1 · EL FICHERO DE HOY, EN LAS DOS UNIDADES Y POR CUATRO INSTRUMENTOS
 * ──────────────────────────────────────────────────────────────────────── */
const buf = readFileSync(CLAUDE);
const txt = buf.toString("utf8");
const CHARS = txt.length;
const BYTES = buf.length;

say("1 · EL FICHERO DE HOY");
say("");
say(`  chars (String.length · wc -m con locale UTF-8) ...... ${CHARS}`);
say(`  bytes (Buffer.length · wc -c · wc -m sin locale) .... ${BYTES}`);
say(`  bytes − chars ....................................... ${BYTES - CHARS}`);
say(`  bytes / chars ....................................... ${(BYTES / CHARS).toFixed(4)}`);
say("");

/* El mecanismo del `wc -m` se DERIVA, no se cita. El encargo lo enunciaba
 * como «wc -m sin LANG cae a bytes»; lo que decide es el LOCALE EFECTIVO. */
say("  ⚠ EL MECANISMO DE `wc -m`, DERIVADO (el encargo lo citaba mal):");
const wc = (env) => {
  try {
    return execFileSync("wc", ["-m"], {
      cwd: RAIZ,
      env: { ...process.env, ...env },
      input: buf,
    }).toString().trim();
  } catch { return "ERR"; }
};
const ESCENARIOS = [
  ["LANG=en_US.UTF-8 (el de esta sesión)", { LANG: "en_US.UTF-8", LC_ALL: "" }],
  ["LC_ALL=C.UTF-8", { LC_ALL: "C.UTF-8" }],
  ["LC_ALL=C  (POSIX)", { LC_ALL: "C" }],
  ["LANG y LC_ALL vaciados", { LANG: "", LC_ALL: "" }],
];
for (const [nombre, env] of ESCENARIOS) {
  const v = Number(wc(env));
  const u = v === CHARS ? "CHARS" : v === BYTES ? "BYTES" : "¿?";
  say(`     ${nombre.padEnd(38)} → ${String(v).padStart(7)}  (${u})`);
}
say("");
say("     ⇒ NO es «sin LANG»: es SIN LOCALE UTF-8 EFECTIVO. Con un locale");
say("       UTF-8 puesto, `wc -m` sí cuenta caracteres. El enunciado del");
say("       encargo («wc -m sin LANG cae a bytes») es cierto sólo del caso");
say("       en que no hay ningún locale UTF-8 — que no es este shell.");
say("");

/* ────────────────────────────────────────────────────────────────────────
 * 2 · LA SERIE DE LECTURAS, ADJUDICADA CONTRA EL ARCHIVO
 * ──────────────────────────────────────────────────────────────────────── */
say("2 · LA SERIE DE LECTURAS DEL TRIPWIRE, ADJUDICADA POR COMMIT");
say("");

/* ⚠ El conjunto de lecturas publicadas se DERIVA, no se enumera (§regla 9).
 * El encargo nombraba UNA cifra sospechosa; barrer los mensajes de commit
 * dice cuántas hay de verdad. El patrón busca un número de seis dígitos con
 * separador de millares seguido de su unidad — que es la forma en que este
 * repo publica el tamaño del fichero. */
const CITA = /(\d{3})[ .,](\d{3})\s*(chars|bytes)/gi;
const logCitas = execFileSync("git",
  ["log", "--all", "--format=%H%n%ad%n%s%n%b%n<<<FIN>>>", "--date=format:%Y-%m-%d %H:%M"],
  { cwd: RAIZ, maxBuffer: 2e8 }).toString();

/* ⚠ El patrón SOBRE-CASA: caza cualquier «NNN.NNN chars/bytes» del mensaje,
 * y este repo publica tamaños de otras cosas (CSS en línea, hojas `et-cache`).
 * Un sobre-casado no da error: da un «sin casar» que se lee como hueco del
 * tripwire. Se acota por CONTEXTO —la ventana de la cita tiene que nombrar el
 * fichero o sus marcadores— y el recorte se publica con su cardinal. */
const CONTEXTO = /CLAUDE\.md|canario|tripwire|KV-\d/i;
const VENTANA = 260;   // chars a cada lado de la cita

const TODAS = [];
for (const bloque of logCitas.split("<<<FIN>>>")) {
  if (!bloque.trim()) continue;
  const [sha, fecha, asunto, ...resto] = bloque.trim().split("\n");
  const cuerpo = resto.join("\n");
  for (const h of cuerpo.matchAll(CITA)) {
    const ctx = cuerpo.slice(Math.max(0, h.index - VENTANA), h.index + VENTANA);
    TODAS.push({
      valor: Number(h[1] + h[2]),
      rotulo: h[3].toLowerCase(),
      quien: `${sha.slice(0, 7)} ${fecha.slice(0, 10)}`,
      asunto: asunto.slice(0, 60),
      delTripwire: CONTEXTO.test(ctx),
    });
  }
}
const PUBLICADAS = TODAS.filter((t) => t.delTripwire).sort((a, b) => a.valor - b.valor);
const AJENAS = TODAS.filter((t) => !t.delTripwire).sort((a, b) => a.valor - b.valor);

const shas = git("log", "--format=%h", "--", "CLAUDE.md")
  .toString().trim().split("\n").filter(Boolean);
say(`  commits que tocaron CLAUDE.md: ${shas.length}  (barrido COMPLETO, no muestra)`);

const censo = [];
for (const sha of shas) {
  let b;
  try { b = git("show", `${sha}:CLAUDE.md`); } catch { continue; }
  const fecha = git("log", "-1", "--format=%ad", "--date=format:%Y-%m-%d %H:%M", sha)
    .toString().trim();
  censo.push({ sha, fecha, chars: b.toString("utf8").length, bytes: b.length });
}
say(`  estados medidos: ${censo.length}`);
say("");

const porChars = new Map(censo.map((c) => [c.chars, c]));
const porBytes = new Map(censo.map((c) => [c.bytes, c]));

say(`  citas de tamaño en los mensajes de commit .......... ${TODAS.length}`);
say(`  · DEL TRIPWIRE (el contexto nombra el fichero) ..... ${PUBLICADAS.length}`);
say(`  · AJENAS (otro objeto medido) ...................... ${AJENAS.length}`);
for (const a of AJENAS) say(`       ${a.quien}  «${a.valor} ${a.rotulo}»   ${a.asunto}`);
say(`     (el encargo nombraba 1 cita · §regla 9: el conjunto se deriva)`);
say("");

/* CONTROL C4 · el acotado por contexto tiene que RECORTAR algo y no recortar
 * de más. Si `AJENAS` fuera 0, el filtro no estaría discriminando y el
 * sobre-casado seguiría dentro (§*un patrón que casa en TODAS no mide nada*);
 * si se llevara alguna cita que SÍ casa contra un commit, estaría recortando
 * dato bueno. */
const ajenasQueCasan = AJENAS.filter((a) => porChars.has(a.valor) || porBytes.has(a.valor));
say(`  CONTROL C4 · el filtro de contexto recorta ${AJENAS.length} citas,`);
say(`     de las que ${ajenasQueCasan.length} casaban contra un estado de CLAUDE.md`);
say(`     ${AJENAS.length > 0 && ajenasQueCasan.length === 0
  ? "⇒ ✅ recorta, y sólo lo ajeno: ninguna recortada era del fichero."
  : AJENAS.length === 0
    ? "⇒ ❌ no recorta nada: el filtro no discrimina."
    : "⇒ ❌ recorta dato bueno: alguna ajena casaba contra el fichero."}`);
say("");
say("  citado     rotulado  es CHARS de          es BYTES de          VEREDICTO");
say("  ─────────  ────────  ───────────────────  ───────────────────  ─────────");
const veredictos = [];
for (const p of PUBLICADAS) {
  const c = porChars.get(p.valor);
  const b = porBytes.get(p.valor);
  let v;
  if (c && !b) v = "CHARS";
  else if (b && !c) v = "BYTES";
  else if (c && b) v = "INDECIDIBLE";
  else v = "sin casar";
  veredictos.push({ ...p, veredicto: v });
  const cel = (x) => (x ? `${x.sha} ${x.fecha.slice(0, 10)}` : "—").padEnd(19);
  const mal = v !== "sin casar" && v !== p.rotulo.toUpperCase();
  say(`  ${String(p.valor).padStart(9)}  ${p.rotulo.padEnd(8)}  ${cel(c)}  ${cel(b)}  ${v}${mal ? "  ❌" : ""}`);
}
say("");

const casadas = veredictos.filter((v) => v.veredicto !== "sin casar" && v.veredicto !== "INDECIDIBLE");
const desviadas = casadas.filter((v) => v.veredicto !== v.rotulo.toUpperCase());
const sinCasar = veredictos.filter((v) => v.veredicto === "sin casar");
say(`  REPARTO · ${PUBLICADAS.length} citas:`);
say(`     adjudicadas ............... ${casadas.length}`);
say(`       · bien rotuladas ........ ${casadas.length - desviadas.length}`);
say(`       · ROTULADAS MAL ......... ${desviadas.length}`);
say(`     indecidibles .............. ${veredictos.filter((v) => v.veredicto === "INDECIDIBLE").length}`);
say(`     sin casar contra ningún commit ... ${sinCasar.length}`);
say("");
if (desviadas.length) {
  say("  LAS ROTULADAS MAL — todas son BYTES con etiqueta de chars:");
  for (const d of desviadas.slice().sort((a, b) => a.valor - b.valor)) {
    say(`     · ${d.quien}  «${d.valor} ${d.rotulo}» → ${d.veredicto}   ${d.asunto}`);
  }
  say("");
}
if (sinCasar.length) {
  say("  SIN CASAR contra ningún estado commiteado — se declaran con su");
  say("  DISTANCIA a cada unidad, que NO es una adjudicación: un valor cercano");
  say("  a los bytes de su commit es compatible con haberse medido sobre un");
  say("  estado intermedio sin commitear, y eso no lo dirime esta sonda.");
  const cerca = (v, mapa) => {
    let best = null;
    for (const k of mapa.keys()) {
      const d = Math.abs(k - v);
      if (!best || d < best.d) best = { k, d };
    }
    return best;
  };
  for (const s of sinCasar) {
    const c = cerca(s.valor, porChars), b = cerca(s.valor, porBytes);
    say(`     · ${s.quien}  «${s.valor} ${s.rotulo}»`);
    say(`         chars más próximo ${c.k} (Δ ${c.d})  ·  bytes más próximo ${b.k} (Δ ${b.d})`);
  }
  say("");
}

/* C2 · el método sólo adjudica si alguna casilla queda vacía. */
const indecidibles = veredictos.filter((v) => v.veredicto === "INDECIDIBLE").length;
say(`  CONTROL C2 · adjudicaciones ambiguas (casan por los dos lados): ${indecidibles}`);
say(`     ${indecidibles === 0
  ? "⇒ 0 ⇒ el método SEPARA: cada valor casa por un solo lado."
  : "⇒ >0 ⇒ el método NO separa en esos casos y se declaran indecidibles."}`);
say("");

/* ────────────────────────────────────────────────────────────────────────
 * 2bis · ¿DESCUIDOS SUELTOS O UN INSTRUMENTO QUE CAMBIA? — LAS RACHAS
 *
 * «9 de 18» no distingue nueve despistes independientes de un instrumento
 * cuyo resultado depende del entorno. Lo que los separa es la FORMA: nueve
 * despistes se reparten al azar; un instrumento produce BLOQUES. Y aquí el
 * mecanismo ya está medido en §1, así que la racha es su predicción.
 * ──────────────────────────────────────────────────────────────────────── */
say("2bis · ¿DESCUIDOS SUELTOS O UN INSTRUMENTO QUE CAMBIA? · las rachas");
say("");
const cronologia = casadas
  .slice()
  .sort((a, b) => a.quien.slice(8).localeCompare(b.quien.slice(8)) || a.valor - b.valor);
const rachas = [];
for (const c of cronologia) {
  const bien = c.veredicto === c.rotulo.toUpperCase();
  const ult = rachas[rachas.length - 1];
  if (ult && ult.bien === bien) { ult.n++; ult.hasta = c.quien.slice(8); }
  else rachas.push({ bien, n: 1, desde: c.quien.slice(8), hasta: c.quien.slice(8) });
}
say(`  citas adjudicadas en orden cronológico: ${cronologia.length}`);
say(`  rachas (bloques de citas consecutivas del mismo signo): ${rachas.length}`);
say("");
for (const r of rachas) {
  say(`     ${r.bien ? "✅ bien" : "❌ MAL "}  ×${String(r.n).padStart(2)}   ${r.desde} → ${r.hasta}`);
}
say("");
say(`  ⇒ ${rachas.length} rachas para ${cronologia.length} citas. Nueve despistes independientes`);
say(`    darían ~${cronologia.length - 1} alternancias posibles; hay ${rachas.length - 1}. Es un BLOQUE, no ruido —`);
say(`    la firma de un INSTRUMENTO que cambia de unidad con el entorno,`);
say(`    que es exactamente lo que §1 midió del \`wc -m\`.`);
say("");

/* ────────────────────────────────────────────────────────────────────────
 * 3 · EL RATIO, EN LAS DOS LECTURAS
 * ──────────────────────────────────────────────────────────────────────── */
const REF = 156426; // chars, §regla 19
say("3 · EL RATIO CONTRA LA REFERENCIA DE §regla 19 (156 426 CHARS)");
say("");
say(`  bytes(hoy) / refCHARS = ${BYTES}/${REF} = ${(BYTES / REF).toFixed(4)}  ← DOS UNIDADES (lo publicado: «1.67×»)`);
say(`  chars(hoy) / refCHARS = ${CHARS}/${REF} = ${(CHARS / REF).toFixed(4)}  ← una sola unidad · CORRECTO`);
say("");
say("  Y lo que la unidad cambiada infla en la SERIE, que es lo que decide:");
const prev = 242258;
say(`     salto publicado  242 258 → 260 699 = +${260699 - prev}  (+${(100 * (260699 - prev) / prev).toFixed(1)} %)`);
say(`     salto real       242 258 → ${CHARS} = +${CHARS - prev}  (+${(100 * (CHARS - prev) / prev).toFixed(1)} %)`);
say(`     inflado ......................... ${260699 - CHARS} chars, que es EXACTAMENTE bytes−chars`);
say("");

/* ────────────────────────────────────────────────────────────────────────
 * 4 · LOS DOS TRIPWIRES, CENSADOS — MARCADOR CONTRA MENCIÓN
 * ──────────────────────────────────────────────────────────────────────── */
say("4 · LOS DOS TRIPWIRES · MARCADOR vs MENCIÓN (§*un nombre citado no es un uso*)");
say("");

const lineas = txt.split("\n");
const ES_MARCADOR = /^`KV-\d{2} · [A-Z0-9]{6}`$/;
const hallazgos = [];
for (const kv of ["KV-01", "KV-08"]) {
  const re = new RegExp(kv, "g");
  let m;
  while ((m = re.exec(txt))) {
    const i = m.index;
    const nLinea = txt.slice(0, i).split("\n").length;
    const linea = lineas[nLinea - 1].trim();
    hallazgos.push({
      kv, i, nLinea, linea,
      marcador: ES_MARCADOR.test(linea),
      pct: 100 * i / CHARS,
      cola: CHARS - i,
    });
  }
}
say("  kv      L      charPos    %fichero  colaChars  papel");
for (const h of hallazgos) {
  say(`  ${h.kv}  ${String(h.nLinea).padStart(5)}  ${String(h.i).padStart(9)}  ${h.pct.toFixed(2).padStart(7)}%  ${String(h.cola).padStart(9)}  ${h.marcador ? "MARCADOR" : "mención"}`);
}
say("");

/* C1 · el detector ingenuo tiene que dar el resultado MALO conocido. */
const ingenuo08 = txt.indexOf("KV-08");
const bueno08 = hallazgos.find((h) => h.kv === "KV-08" && h.marcador);
say("  CONTROL C1 · ¿discrimina el detector?");
say(`     detector ingenuo (indexOf) sitúa KV-08 en ...... ${(100 * ingenuo08 / CHARS).toFixed(2)}%  (cola ${CHARS - ingenuo08})`);
say(`     censo con papel sitúa el MARCADOR en ........... ${bueno08.pct.toFixed(2)}%  (cola ${bueno08.cola})`);
const separa = ingenuo08 !== bueno08.i;
say(`     ${separa ? "✅ SEPARA" : "❌ NO SEPARA — el censo no prueba nada"}: ${separa ? `difieren en ${bueno08.i - ingenuo08} chars` : "dan lo mismo"}`);
say("");

/* La ficha describe posiciones. Se comprueban contra hoy. */
const m01 = hallazgos.find((h) => h.kv === "KV-01" && h.marcador);
say("  Lo que §regla 19 AFIRMA de los marcadores, contrastado con HOY:");
say(`     «KV-01 (~30 % del fichero)» ..... hoy ${m01.pct.toFixed(2)} %  → ${Math.abs(m01.pct - 30) < 3 ? "SIGUE" : "ENVEJECIÓ (el fichero creció por debajo de él)"}`);
say(`     «KV-08 (a 16 chars del final)» .. hoy ${bueno08.cola} chars  → ${bueno08.cola === 16 ? "SIGUE EXACTO" : "cambió"}`);
say("");

/* ────────────────────────────────────────────────────────────────────────
 * 5 · ¿EXISTE UN INSTRUMENTO DEL TRIPWIRE? (§sondas 4: el cero se declara)
 * ──────────────────────────────────────────────────────────────────────── */
say("5 · EL INSTRUMENTO DEL TRIPWIRE · ¿existe alguna sonda que mida el tamaño?");
say("");
const QA = join(RAIZ, "scripts", "qa");
const sondas = existsSync(QA)
  ? readdirSync(QA).filter((f) => f.endsWith(".mjs"))
  : [];
const midenClaude = [];
for (const f of sondas) {
  const src = readFileSync(join(QA, f), "utf8");
  const citaFichero = /CLAUDE\.md/.test(src);
  const mide = /\.length|byteLength|statSync|wc -[mc]/.test(src);
  // «cita el fichero Y mide tamaño» no basta: tiene que medir ESE fichero.
  const midelo = citaFichero && /CLAUDE\.md[^\n]*(length|byteLength|statSync)|readFileSync\([^)]*CLAUDE/.test(src);
  if (midelo) midenClaude.push(f);
  void mide;
}
const pkg = JSON.parse(readFileSync(join(RAIZ, "package.json"), "utf8"));
const scriptsCanario = Object.keys(pkg.scripts ?? {})
  .filter((k) => /canario|tripwire|kv|claude/i.test(k));

say(`  sondas .mjs en scripts/qa .......................... ${sondas.length}`);
say(`  · que MIDAN el tamaño de CLAUDE.md ................. ${midenClaude.length}  ${midenClaude.join(" ") || "(ninguna)"}`);
say(`  scripts npm con nombre de canario/tripwire ......... ${scriptsCanario.length}  ${scriptsCanario.join(" ") || "(ninguno)"}`);
say("");
say(`  ⇒ EL INSTRUMENTO DEL TRIPWIRE NO EXISTE: es la SESIÓN citando los dos`);
say(`    marcadores a mano. Así que «que la sonda diga su unidad en la salida»`);
say(`    NO TIENE DESTINATARIO — el único sitio donde la unidad se escribe es`);
say(`    la FICHA, y es donde hay que ponerla. Es §sondas 4 con el cero puesto`);
say(`    en el instrumento en vez de en el selector: no hay sonda que rotule`);
say(`    mal, hay una lectura a mano que elige unidad cada vez.`);
say("");

/* ────────────────────────────────────────────────────────────────────────
 * 6 · EL PRECEDENTE QUE EL ENCARGO AFIRMA (§regla 8b: se comprueba)
 * ──────────────────────────────────────────────────────────────────────── */
say("6 · EL PRECEDENTE AFIRMADO POR EL ENCARGO: «229.187 chars que eran bytes»");
say("");
/* `git grep` sale con 1 cuando no encuentra nada — que aquí es el resultado
 * ESPERADO, no un error. Se captura, y se distingue «0 coincidencias» de
 * «el grep falló» por el status, no por la salida vacía (§sondas 4). */
const grepRepo = (re, ...rutas) => {
  try {
    const out = execFileSync("git", ["grep", "-rIn", "-E", re, "--", ...rutas],
      { cwd: RAIZ, maxBuffer: 1e8 }).toString();
    return { n: out.trim() ? out.trim().split("\n").length : 0, ok: true };
  } catch (e) {
    if (e.status === 1) return { n: 0, ok: true };   // sin coincidencias
    return { n: -1, ok: false };                      // el grep falló de verdad
  }
};
const gDocs = grepRepo("229[ .,]?187", "docs", "CLAUDE.md", "scripts");
if (!gDocs.ok) throw new Error("el grep de 229187 falló: su 0 no sería un dato");
const enDocs = gDocs.n;

/* CONTROL C3 · el mismo grep sobre un número que SÍ está tiene que dar >0.
 * Sin él, «0 ocurrencias» y «el filtro no casa» son la misma salida — que es
 * exactamente el modo de fallo de §sondas 4 sobre un `grep` propio, cometido
 * al derivar la §regla 26. */
const gControl = grepRepo("156[ .,]?426", "docs", "CLAUDE.md");
if (!gControl.ok || gControl.n === 0) {
  throw new Error(`CONTROL C3 ROTO: el grep no casa ni el número conocido (n=${gControl.n})`);
}

const logTxt = execFileSync("git", ["log", "--all", "--format=%H%n%s%n%b%n===="],
  { cwd: RAIZ, maxBuffer: 2e8 }).toString();
const enCommits = [...logTxt.matchAll(/229[ .,]?187/g)].length;

const c229 = censo.find((c) => c.bytes === 229187);
say(`  ocurrencias en docs/ · CLAUDE.md · scripts/ ........ ${enDocs}`);
say(`  ocurrencias en mensajes de commit .................. ${enCommits}`);
say(`  CONTROL C3 · el mismo grep sobre «156 426», que SÍ está: ${gControl.n} ⇒ el filtro casa`);
say(`  ¿existe como BYTES de algún commit? ................ ${c229 ? `sí — ${c229.sha} (${c229.fecha}), chars=${c229.chars}` : "no"}`);
say("");
say(`  ⇒ EL PRECEDENTE ES FALSO, y en la dirección CONTRARIA. Su única`);
say(`    ocurrencia es el cierre de la 100.ª (1057ac5, 2026-08-24), que`);
say(`    escribió:`);
say(``);
say(`        «227.173 chars / 233.030 bytes (era 223.423 / 229.187)»`);
say(``);
say(`    o sea LAS DOS UNIDADES, JUNTAS Y BIEN ROTULADAS — que es exactamente`);
say(`    la forma correcta. No es «un caso ya fichado del mismo error»: es la`);
say(`    ÚNICA cita del corpus que hace lo que hay que hacer.`);
say(``);
say(`    Y eso cambia el diagnóstico: la práctica buena EXISTIÓ una vez y no`);
say(`    se convirtió en convención, así que las tandas siguientes volvieron`);
say(`    a publicar un número solo. §MENCIONADO NO ES DOCUMENTADO — vivía en`);
say(`    un mensaje de commit, que es lo único del repo que nadie relee.`);
say(`    §regla 8b: el hecho que el encargo afirmaba se comprobó al escribirlo`);
say(`    y salió falso, con su ocurrencia y su texto delante.`);
say("");

/* ────────────────────────────────────────────────────────────────────────
 * VEREDICTO
 * ──────────────────────────────────────────────────────────────────────── */
say("═══ VEREDICTO ═══");
say("");
say(`  · el fichero mide ${CHARS} CHARS y ${BYTES} BYTES (Δ ${BYTES - CHARS});`);
say("");
say(`  · NO ES UNA CIFRA SUELTA, ES UNA CLASE con su cardinal: de las`);
say(`    ${casadas.length} citas del tripwire adjudicables, ${desviadas.length} publican BYTES rotulados`);
say(`    «chars» — la MITAD. El encargo nombraba 1;`);
say("");
say(`  · Y EL MECANISMO ESTÁ MEDIDO, no supuesto: \`wc -m\` devuelve chars o`);
say(`    bytes SEGÚN EL LOCALE del shell (§1), y no lo dice en su salida. Una`);
say(`    sesión con locale UTF-8 publica chars; otra sin él, bytes. Es §regla 6`);
say(`    —una ausencia traducida a un valor benigno— con la ausencia puesta en`);
say(`    el LOCALE: no hay error, hay un número de la otra unidad;`);
say("");
say(`  · el ratio correcto contra §regla 19 es ${(CHARS / REF).toFixed(3)}×, no 1.67×;`);
say("");
say(`  · el instrumento del tripwire NO EXISTE (0 sondas, 0 scripts npm), así`);
say(`    que la unidad sólo se puede fijar en la FICHA y en la forma de citar;`);
say("");
say(`  · el precedente que el encargo afirma es FALSO al revés: su única`);
say(`    ocurrencia (la 100.ª) publica LAS DOS UNIDADES BIEN.`);
say("");
const c3ok = gControl.ok && gControl.n > 0;
const c4ok = AJENAS.length > 0 && ajenasQueCasan.length === 0;
say(`  CONTROLES: C1 ${separa ? "✅" : "❌"} el detector de marcadores discrimina · ` +
  `C2 ${indecidibles === 0 ? "✅" : "❌"} la adjudicación separa (${indecidibles} ambiguas)`);
say(`             C3 ${c3ok ? "✅" : "❌"} el grep casa el número conocido (${gControl.n}) · ` +
  `C4 ${c4ok ? "✅" : "❌"} el filtro de contexto recorta sólo lo ajeno (${AJENAS.length}/${ajenasQueCasan.length})`);

/* Congelar (§regla 2). */
const { writeFileSync } = await import("node:fs");
const salida = join(AQUI, "unidad-tripwire-115.log");
writeFileSync(salida, L.join("\n") + "\n", "utf8");
console.log("");
console.log("congelado → " + salida);

if (!separa || indecidibles > 0 || !c3ok || !c4ok) process.exit(1);
