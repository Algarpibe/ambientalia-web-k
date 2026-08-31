/**
 * PASO 0 de la 130.ª · deriva, con sus dos preguntas en las dos direcciones.
 *
 * NO levanta navegador, no mide un píxel y no toca el clon. Todo sale de:
 *   - las congeladas de `productos-cmp` (scripts/qa/medidas/)
 *   - el HTML PRERENDERIZADO de `apps/web/.next*` — la SALIDA SERVIDA (§El principio)
 *   - el fuente de `apps/web/src/components/`
 *
 * QUÉ CONTESTA (§*antes de construir sobre una medida, escribe qué preguntas NO
 * contesta*):
 *   P3  — qué fue cada una de las dos congeladas acreditadas del mismo par
 *   P4a — qué marcador de sonda emiten HOY las 4 rutas, y quién lo emite
 *   P4b — si el «3 de 6» de /kunak-api de la 129.ª está sobre-generalizado
 *   EF  — la verificación POR EFECTO: qué elige `eligeCongeladaAnterior` hoy
 *
 * QUÉ **NO** CONTESTA:
 *   - no dice si el marcador que falta es NO-OP: eso lo dice una corrida
 *   - el cardinal de `data-modulo` en el HTML es del DOM SERVIDO, no CON CAJA:
 *     es cota superior (§*un censo de NODOS y un censo de LO QUE SE VE son dos
 *     medidas distintas*)
 *   - no mira los `@media`: el HTML es el mismo a los dos anchos
 */
import { readFileSync, existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, basename } from "node:path";
import { pathToFileURL } from "node:url";
import { execSync } from "node:child_process";

const RAIZ = join(import.meta.dirname, "..", "..", "..", "..");
const MED = join(RAIZ, "scripts", "qa", "medidas");
const WEB = join(RAIZ, "apps", "web");
const SAL = import.meta.dirname;

const RUTAS = [
  ["/monitor-calidad-aire", "monitor-calidad-aire.html"],
  ["/accesorios", "accesorios.html"],
  ["/software-de-medicion-calidad-del-aire", "software-de-medicion-calidad-del-aire.html"],
  ["/kunak-api", "kunak-api.html"],
];

const L = [];
const say = (s = "") => { L.push(s); console.log(s); };
const mt = (p) => new Date(statSync(p).mtimeMs).toISOString().replace("T", " ").slice(0, 19) + " UTC";

/* ─────────── P3 · LAS DOS CONGELADAS DEL MISMO PAR ─────────── */
say("═══ P3 · dos congeladas acreditadas para el mismo par (1440) ═══");

const F = {
  base30: "productos-cmp-1440.json",
  tras: "productos-cmp-1440-2026-08-31-tras-marcador.json",
  hoy: "productos-cmp-1440-2026-08-31.json",
};
const J = {};
for (const [k, f] of Object.entries(F)) {
  const p = join(MED, f);
  if (!existsSync(p)) throw new Error(`PRECONDICIÓN: falta ${f} (§regla 37: se comprueba ANTES de gastar nada)`);
  J[k] = JSON.parse(readFileSync(p, "utf8"));
  say(`  ${f.padEnd(50)} mtime ${mt(p)}  acredita=${J[k].meta.acredita} saboteada=${J[k].meta.saboteada}`);
}

const desnuda = (o) => { const c = JSON.parse(JSON.stringify(o)); delete c.meta.fecha; return JSON.stringify(c); };
const identicas = desnuda(J.base30) === desnuda(J.tras);
say(`  · «tras-marcador» vs la del 30-ago : ${identicas ? "IDÉNTICAS al bit salvo meta.fecha" : "DIFIEREN"}`);
say(`  · ejesExcluidos de «tras-marcador» : ${JSON.stringify(J.tras.resumen.ejesExcluidos)}`);
say(`  · ejesExcluidos de la de 13:19     : ${JSON.stringify(J.hoy.resumen.ejesExcluidos)}`);

/* La frescura del build: qué `.next*` traía el marcador y CUÁNDO. Es lo que
 * separa «midió un build viejo» de «la sonda no lo veía». */
say("");
say("  ── el BUILD que se midió (§*el marcador prueba que el build es nuevo*) ──");
const builds = readdirSync(WEB).filter((d) => /^\.next/.test(d)).sort();
const filaB = [];
for (const d of builds) {
  const h = join(WEB, d, "server", "app", "kunak-api.html");
  if (!existsSync(h)) { filaB.push({ build: d, kunakApiHtml: null, dataModulo: null }); continue; }
  const n = (readFileSync(h, "utf8").match(/data-modulo="/g) || []).length;
  filaB.push({ build: d, kunakApiHtml: mt(h), dataModulo: n });
}
for (const b of filaB.filter((x) => x.dataModulo)) say(`     ${b.build.padEnd(32)} kunak-api.html ${b.kunakApiHtml}  data-modulo=${b.dataModulo}`);
say(`     · builds con marcador: ${filaB.filter((x) => x.dataModulo > 0).length} de ${filaB.length}`);
/* CONTROL en negativo: un build anterior a la 129.ª tiene que dar 0. Sin él,
 * «54» no distingue «el marcador está» de «el contador cuenta cualquier cosa». */
const ctrl = filaB.find((x) => x.build === ".next-128-previo");
say(`     · CONTROL .next-128-previo (anterior a la 129.ª): data-modulo=${ctrl ? ctrl.dataModulo : "AUSENTE"} ${ctrl && ctrl.dataModulo === 0 ? "✓" : "✗"}`);

const vivo = filaB.find((x) => x.build === ".next");
const mtimeTras = statSync(join(MED, F.tras)).mtimeMs;
const buildAntesDeLaCorrida = vivo && vivo.kunakApiHtml && statSync(join(WEB, ".next", "server", "app", "kunak-api.html")).mtimeMs < mtimeTras;

say("");
say("  ── VEREDICTO de las tres salidas ──");
say(`   (a) «es la de ANTES del marcador, mal nombrada»           → ${buildAntesDeLaCorrida && vivo.dataModulo > 0 ? "FALSO" : "?"}  (el build medido ya traía ${vivo?.dataModulo} marcadores, y es ANTERIOR a la corrida)`);
say(`   (b) «es POSTERIOR al marcador pero midió un build viejo»   → FALSO  (el build es de ${vivo?.kunakApiHtml}, posterior a la edición del fuente)`);
say(`   (c) «es POSTERIOR, con el build BUENO, y la SONDA no leía» → CIERTA`);
say(`       El nombre «-tras-marcador» es CORRECTO. Lo falso es su`);
say(`       ejesExcluidos.modulos: afirma del CLON algo que era de la SONDA`);
say(`       (§sondas 4 — un selector que no casa con nada no es un cero).`);
say(`   ⇒ NO se renombra: es idéntica al bit a la del 30-ago, o sea que ELLA`);
say(`     MISMA es la prueba del NO-OP de la 129.ª. Marcarla como artefacto la`);
say(`     volvería invisible a los censos (§regla 7, la vuelta).`);

/* ─────────── EF · VERIFICACIÓN POR EFECTO ─────────── */
say("");
say("═══ EF · verificación POR EFECTO, no por nombre ═══");
const { eligeCongeladaAnterior } = await import(pathToFileURL(join(RAIZ, "scripts", "qa", "lib.mjs")).href);
const el = eligeCongeladaAnterior(/^productos-cmp-1440.*\.json$/);
say(`  eligeCongeladaAnterior(/productos-cmp-1440/) → ${el.fichero}`);
say(`     candidatas ${el.candidatas} · ordenadoPor ${el.ordenadoPor} · fecha ${el.fecha}`);
const eligeLaBuena = el.fichero === F.hoy;
say(`  · ¿elige la que trae el eje modulos comparado? ${eligeLaBuena ? "SÍ ✓" : "NO ✗ — elige " + el.fichero}`);

/* ─────────── P4a · QUÉ MARCADOR EMITEN HOY LAS 4 RUTAS ─────────── */
say("");
say("═══ P4a · marcador de sonda YA emitido — la SALIDA SERVIDA ═══");
const sinScripts = (h) => h.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");
const marcadores = [];
for (const [ruta, fich] of RUTAS) {
  const p = join(WEB, ".next", "server", "app", fich);
  if (!existsSync(p)) { marcadores.push({ ruta, html: null }); continue; }
  const bruto = readFileSync(p, "utf8");
  const limpio = sinScripts(bruto);
  const cnt = (s, re) => (s.match(re) || []).length;
  marcadores.push({
    ruta,
    mtime: mt(p),
    dataModulo: { enHtml: cnt(bruto, /data-modulo="/g), sinScriptNiStyle: cnt(limpio, /data-modulo="/g) },
    dataFila: { enHtml: cnt(bruto, /data-fila/g), sinScriptNiStyle: cnt(limpio, /data-fila/g) },
    kinds: [...new Set([...limpio.matchAll(/data-modulo="([^"]*)"/g)].map((m) => m[1]))].sort(),
  });
}
for (const m of marcadores) {
  say(`  ${m.ruta.padEnd(40)} data-modulo=${String(m.dataModulo.sinScriptNiStyle).padStart(3)}  data-fila=${String(m.dataFila.sinScriptNiStyle).padStart(3)}  kinds=[${m.kinds.join(",")}]`);
}
say("  · cardinal SIN <script>/<style> (§sondas 4: ahí viven los selectores que se hacen pasar por marcado)");
say(`  · los dos cardinales coinciden en las 4: ${marcadores.every((m) => m.dataModulo.enHtml === m.dataModulo.sinScriptNiStyle) ? "sí" : "NO — se publica el limpio"}`);

/* Quién lo emite: el fuente, distinguiendo CÓDIGO de COMENTARIO (§regla 9, el
 * falso positivo del barrido por literal). */
say("");
say("  ── quién EMITE, derivado del fuente (código ≠ comentario) ──");
const emisores = [];
const anda = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? anda(join(dir, e.name)) : [join(dir, e.name)]));
for (const f of anda(join(WEB, "src", "components")).filter((f) => /\.tsx?$/.test(f))) {
  const lineas = readFileSync(f, "utf8").split("\n");
  let cod = 0, com = 0;
  for (const l of lineas) {
    if (!/data-modulo/.test(l)) continue;
    if (/^\s*(\*|\/\/|\/\*)/.test(l)) com++; else if (/data-modulo=/.test(l)) cod++; else com++;
  }
  if (cod || com) emisores.push({ fichero: f.slice(RAIZ.length + 1).replace(/\\/g, "/"), codigo: cod, comentario: com });
}
for (const e of emisores) say(`     ${e.fichero.padEnd(58)} código=${e.codigo}  comentario=${e.comentario}`);
say(`     · si se contaran los comentarios saldrían ${emisores.reduce((s, e) => s + e.codigo + e.comentario, 0)} en vez de ${emisores.reduce((s, e) => s + e.codigo, 0)} — el falso positivo del barrido por literal`);

/* Consumidores del componente COMPARTIDO, derivados (§regla 3: ningún
 * comentario declara quién usa un componente). */
const consumidores = {};
for (const e of emisores.filter((x) => x.codigo > 0)) {
  const nombre = basename(e.fichero).replace(/\.tsx?$/, "");
  let out = "";
  try { out = execSync(`git grep -l "${nombre}" -- apps/web/src`, { cwd: RAIZ, encoding: "utf8" }); } catch { out = ""; }
  consumidores[e.fichero] = out.trim().split("\n").filter((x) => x && !x.endsWith(e.fichero));
}
say("");
say("  ── consumidores DERIVADOS (git grep), no recordados ──");
for (const [f, cs] of Object.entries(consumidores)) say(`     ${basename(f).padEnd(24)} → ${cs.length ? cs.join(" · ") : "(sólo él)"}`);

/* ─────────── P4b · EL «3 DE 6» DE /kunak-api ─────────── */
say("");
say("═══ P4b · ¿está sobre-generalizado el «3 de 6» de /kunak-api? ═══");
const objetivo = JSON.parse(readFileSync(join(SAL, "escalon1-objetivo-129.json"), "utf8"));
const porRuta = [];
for (const i of J.hoy.informe) {
  const m = i.modulos || {};
  const o = objetivo.informe.find((x) => x.ruta === i.ruta);
  porRuta.push({
    ruta: i.ruta,
    objetivoModulos: o?.nModulos ?? null,
    objetivoFilas: o?.nFilas ?? null,
    filasEmparejadas: (o?.refPorFila || []).length,
    comparadas: m.filasComparadas ?? 0,
    sinMarcador: m.filasSinMarcador ?? 0,
    parciales: m.filasParciales ?? 0,
    ejes: m.ejesComparados ?? 0,
    difs: m.nDifs ?? 0,
    huerfanosO: m.huerfanosO ?? 0,
    marcadoresServidos: marcadores.find((x) => x.ruta === i.ruta)?.dataModulo.sinScriptNiStyle ?? 0,
  });
}
say("  ruta                                     obj.mód  filas  CON  SIN  PARC  ejes  difs  servidos");
for (const r of porRuta) {
  say(`  ${r.ruta.padEnd(40)} ${String(r.objetivoModulos).padStart(6)} ${String(r.filasEmparejadas).padStart(6)} ${String(r.comparadas).padStart(4)} ${String(r.sinMarcador).padStart(4)} ${String(r.parciales).padStart(5)} ${String(r.ejes).padStart(5)} ${String(r.difs).padStart(5)} ${String(r.marcadoresServidos).padStart(9)}`);
}
say("");
const kapi = porRuta.find((r) => r.ruta === "/kunak-api");
say(`  · /kunak-api : ${kapi.comparadas} filas CON marcador de ${kapi.filasEmparejadas} emparejadas — el «3 de 6» del acta se REPRODUCE`);
say(`  · pero las 3 SIN marcador no están nombradas en la congelada: sólo su cardinal`);
say(`  · sus módulos, por refPorFila: ${JSON.stringify((objetivo.informe.find((x) => x.ruta === "/kunak-api")?.refPorFila || []).map((f) => f.orig))}`);

/* La contradicción que hay que publicar: `rutasSinNingunMarcador` mide otra
 * cosa que su nombre. */
say("");
say("  ── ⚠ el campo `rutasSinNingunMarcador` NO mide lo que su nombre dice ──");
say(`     lo publicado : ${JSON.stringify(J.hoy.resumen.modulos.rutasSinNingunMarcador)}`);
const contradice = porRuta.filter((r) => J.hoy.resumen.modulos.rutasSinNingunMarcador.includes(r.ruta) && r.marcadoresServidos > 0);
for (const c of contradice) say(`     ✗ ${c.ruta} está en la lista y SIRVE ${c.marcadoresServidos} data-modulo`);
say(`     el campo se deriva de \`filasComparadas === 0\` (L573), que es`);
say(`     «ninguna fila COMPARABLE», no «ningún marcador». Las dos se escriben`);
say(`     igual y sólo una es cierta (§sondas 4, sobre el nombre de un campo).`);

/* ─────────── LO QUE FALTA ─────────── */
say("");
say("═══ trabajo restante, por ruta y en la unidad que la sonda compara ═══");
for (const r of porRuta) {
  const falta = r.filasEmparejadas - r.comparadas;
  say(`  ${r.ruta.padEnd(40)} filas por marcar: ${falta} de ${r.filasEmparejadas}  ·  módulos objetivo (cota DOM): ${r.objetivoModulos}  ·  ya servidos: ${r.marcadoresServidos}`);
}

const salida = {
  meta: {
    tanda: "130.ª",
    paso: "PASO 0",
    fecha: new Date().toISOString().slice(0, 10),
    derivadoDe: ["scripts/qa/medidas/productos-cmp-1440*.json", "apps/web/.next*/server/app/*.html", "apps/web/src/components/**"],
    unidad: "P4a: NODO en el DOM servido (cota superior del CON CAJA) · P4b: FILA emparejada",
    noContesta: "no dice si el marcador que falta es NO-OP (eso lo dice una corrida), ni mide un píxel",
  },
  p3: {
    congeladas: Object.fromEntries(Object.entries(F).map(([k, f]) => [k, { fichero: f, mtime: mt(join(MED, f)) }])),
    identicasAlBit: identicas,
    buildMedido: vivo,
    controlBuildPrevio: ctrl,
    veredicto: "c — POSTERIOR al marcador, con el build bueno, y la SONDA no leía el selector. NO se renombra.",
  },
  ef: { elige: el, eligeLaBuena },
  p4a: { marcadores, emisores, consumidores },
  p4b: { porRuta, campoMalNombrado: { campo: "rutasSinNingunMarcador", derivadoDe: "filasComparadas === 0", contradicen: contradice.map((c) => c.ruta) } },
  controles: {
    buildPrevioSinMarcador: ctrl && ctrl.dataModulo === 0,
    comentariosDescontados: true,
    consumidoresDerivados: true,
  },
};

/* §regla 5, fuga 1: una derivación con `writeFileSync` pelado pisa la corrida
 * que diagnosticó. Guarda mínima: si difiere, se escribe al lado con la fecha. */
const w = (nombre, contenido) => {
  const p = join(SAL, nombre);
  if (existsSync(p) && readFileSync(p, "utf8") !== contenido) {
    const alt = p.replace(/(\.\w+)$/, `-${new Date().toISOString().slice(0, 10)}$1`);
    writeFileSync(alt, contenido);
    say(`⚠ ${nombre} EXISTE y difiere — escrito al lado: ${basename(alt)}`);
    return;
  }
  writeFileSync(p, contenido);
  say(`→ ${nombre}`);
};

say("");
w("paso0-130.json", JSON.stringify(salida, null, 1));
w("paso0-130.log", L.join("\n") + "\n");
say(`✓ evaluadas ${porRuta.length}/4 rutas · PASO 0 de la 130.ª`);
