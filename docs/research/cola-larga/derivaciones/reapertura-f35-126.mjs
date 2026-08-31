// 126.ª · CIERRE — LA CONDICIÓN DE REAPERTURA DE F3-5, MEDIDA EN VEZ DE SUPUESTA
//
// El encargo la enuncia así: *«si se clonan los 2 vecinos de `monitor` a ≥0.7,
// darían varianza inter-instancia del MISMO arquetipo»*. Antes de escribirla
// tal cual, §*antes de fichar una indeterminación, enumera las separadoras
// candidatas y di por qué cada una no sirve* — porque **la entrada que dirime
// puede estar ya en el repo**, y entonces la condición no es «si se clonan»
// sino «córrelo».
//
// LA PREGUNTA, en tres partes y en la unidad en la que se decide:
//
//   1 · ¿QUIÉNES son los 2 vecinos? Se DERIVAN de `familia-producto-123.json`
//       (Jaccard sobre el repertorio de tipos de módulo), no se recuerdan.
//   2 · ¿ESTÁ SU HTML CAPTURADO? Porque la varianza inter-instancia es una
//       propiedad **del ORIGINAL**, no del clon: clonar no hace falta para
//       medirla. Si el corpus los tiene, la precondición ya está pagada.
//   3 · ¿HAY DOMINIO? Un corpus sin marcadores COMPARTIDOS no serviría: la
//       llave que hizo medible la varianza en la 125.ª es el marcador
//       semántico, y sin marcadores en ≥2 documentos vuelve a haber 0 pares
//       POR CONSTRUCCIÓN (§regla 29, la mitad que faltaba).
//
// ⚠ ALCANCE, declarado: esto **NO mide la varianza** — eso exige navegador y
// geometría, y es trabajo de otra tanda. Contesta si el DOMINIO existe y cuánto
// mide. Son dos afirmaciones distintas y sólo la primera cabe aquí.

import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const CORPUS = join(RAIZ, "corpus/productos");
const DERIV = join(RAIZ, "docs/research/cola-larga/derivaciones");
const FAMILIA = join(DERIV, "familia-producto-123.json");
const APP = join(RAIZ, "apps/web/src/app");

/* ── PRECONDICIONES (§regla 37) ───────────────────────────────────────────── */
if (!existsSync(FAMILIA)) { console.error(`❌ PRECONDICION: falta ${FAMILIA}`); process.exit(1); }

const controles = [];
const ctl = (ok, nombre, detalle) => controles.push({ ok, nombre, detalle });

/* ═══ 1 · QUIÉNES SON, derivados del Jaccard congelado ════════════════════ */
const fam = JSON.parse(readFileSync(FAMILIA, "utf8"));
const UMBRAL = 0.7;
const ANCLA = "monitor-calidad-aire";

/* La congelada guarda, por documento, su lista de vecinos ordenada. Se busca la
   fila del ancla y se filtran los que llegan al umbral. La estructura se
   descubre, no se supone. */
const filas = Array.isArray(fam) ? fam : (fam.vecinos ?? fam.similitud ?? fam.filas ?? null);
let vecinos = null;
if (Array.isArray(filas)) {
  const f = filas.find((x) => (x.doc ?? x.documento ?? x.slug ?? "").includes(ANCLA));
  const lista = f?.vecinos ?? f?.similares ?? null;
  if (Array.isArray(lista)) vecinos = lista.filter((v) => (v.jaccard ?? v.similitud ?? v.valor ?? 0) >= UMBRAL);
}
/* Si la forma no se reconoce, se TIRA en vez de inventar (§regla 6). El log de
   la 123.ª es el respaldo legible y se nombra en el informe. */
if (!vecinos) {
  const log = join(DERIV, "familia-producto-123.log");
  if (!existsSync(log)) { console.error("❌ no se reconoce la forma de familia-producto-123.json y no hay log de respaldo"); process.exit(1); }
  const texto = readFileSync(log, "utf8");
  const linea = texto.split(/\r?\n/).find((l) => l.trim().startsWith(ANCLA));
  if (!linea) { console.error(`❌ el log no trae la fila de ${ANCLA}`); process.exit(1); }
  /* ⚠ La guarda `<= 1` NO es cosmética y la v1 no la tenía: el regex casa
     TAMBIÉN `tipos=10`, que es el CARDINAL de la cabecera de la fila, y con
     `>= 0.7` entraba como vecino con «jaccard 10». Es §sondas 4 en su cara de
     SOBRE-CASADO, y lo que lo caza no es leer el regex sino que **un Jaccard
     vive en [0,1] por definición** — o sea una guarda DERIVADA del objeto, no
     una lista de exclusiones que envejecería. Lo delataron los controles, no
     la lectura. Evidencia:
     `reapertura-f35-126-SONDA-TIPOS-10-COLABA-COMO-VECINO.json`. */
  vecinos = [...linea.matchAll(/([a-z0-9-]+)=([\d.]+)/g)]
    .map((m) => ({ doc: m[1], jaccard: Number(m[2]) }))
    .filter((v) => v.jaccard >= UMBRAL && v.jaccard <= 1);
}
ctl(vecinos.length > 0, `los vecinos de \`${ANCLA}\` a >=${UMBRAL} se DERIVAN (no se recuerdan)`, vecinos.map((v) => `${v.doc}=${v.jaccard}`).join(" · "));

/* Los nombres del log vienen recortados a 22 chars: se resuelven contra el
   corpus por PREFIJO, y se publica cuántos resolvieron. */
const { readdirSync } = await import("node:fs");
const enCorpus = existsSync(CORPUS) ? readdirSync(CORPUS).filter((f) => f.endsWith(".html")) : [];
const resueltos = vecinos.map((v) => {
  const f = enCorpus.find((x) => x.startsWith(v.doc.replace(/-$/, "")));
  return { ...v, fichero: f ?? null };
});
ctl(
  resueltos.every((r) => r.fichero),
  "los nombres recortados del log RESUELVEN contra el corpus",
  resueltos.map((r) => `${r.doc} -> ${r.fichero ?? "SIN RESOLVER"}`).join(" · "),
);

/* ═══ 2 · ¿ESTÁ CAPTURADO? — y ¿está clonado? Son dos preguntas ═══════════ */
const estado = resueltos.map((r) => ({
  vecino: r.doc,
  jaccard: r.jaccard,
  capturado: !!r.fichero && existsSync(join(CORPUS, r.fichero)),
  clonado: existsSync(join(APP, r.fichero ? r.fichero.replace(/\.html$/, "") : "__no__")),
}));
ctl(
  estado.every((e) => e.capturado),
  "LA PRECONDICION YA ESTA PAGADA: el HTML de los 2 vecinos esta CAPTURADO",
  estado.map((e) => `${e.vecino}: capturado=${e.capturado} clonado=${e.clonado}`).join(" · "),
);

/* ═══ 3 · ¿HAY DOMINIO? — marcadores semánticos compartidos ═══════════════ */
/* El mismo predicado que la 125.ª, copiado sin tocar para que lo que difiera no
   pueda venir de aquí. Offline: se leen las clases del HTML, no la geometría. */
const esSemantica = (c) => !/^et[_-]/.test(c) && !/^(wp|has|is|clearfix)/.test(c) && c.length > 2;

function marcadoresDe(html) {
  const cuerpo = html.slice(html.indexOf("<body"));
  const out = new Set();
  for (const m of cuerpo.matchAll(/class\s*=\s*["']([^"']*)["']/gi)) {
    const clases = m[1].split(/\s+/).filter(Boolean);
    /* Sólo los nodos que el constructor marca como sección/fila/módulo, que es
       el universo de la 125.ª. Y fuera el cascarón. */
    if (!clases.some((c) => /^et_pb_(section|row|module)$/.test(c))) continue;
    if (clases.some((c) => /_tb_(header|footer)/.test(c))) continue;
    for (const c of clases) if (esSemantica(c)) out.add(c);
  }
  return out;
}

const FAMILIA_DOCS = [
  { doc: `${ANCLA}.html`, etiqueta: ANCLA },
  ...estado.filter((e) => e.capturado).map((e) => ({ doc: resueltos.find((r) => r.doc === e.vecino).fichero, etiqueta: e.vecino })),
];
const porDoc = {};
const cuenta = new Map();
for (const d of FAMILIA_DOCS) {
  const p = join(CORPUS, d.doc);
  if (!existsSync(p)) { porDoc[d.etiqueta] = null; continue; }
  const ms = marcadoresDe(readFileSync(p, "utf8"));
  porDoc[d.etiqueta] = [...ms].sort();
  for (const m of ms) cuenta.set(m, (cuenta.get(m) ?? 0) + 1);
}
const compartidos = [...cuenta].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]);
const singleton = [...cuenta].filter(([, n]) => n === 1);

ctl(cuenta.size > 0, "se censo algo (hay marcadores semanticos en la familia)", `${cuenta.size} marcadores en ${FAMILIA_DOCS.length} documentos`);
ctl(
  compartidos.length > 0,
  "HAY DOMINIO: marcadores en >=2 documentos de la MISMA familia (si fuera 0, 0 pares por construccion)",
  `${compartidos.length} compartidos · ${singleton.length} singleton`,
);
/* Y que DISCRIMINE: si todos fueran compartidos, el censo no separaría nada. */
ctl(
  singleton.length > 0,
  "el censo DISCRIMINA (ni cero compartidos ni pleno)",
  `compartidos ${compartidos.length} de ${cuenta.size}`,
);

const salida = {
  fecha: new Date().toISOString().slice(0, 10),
  tanda: 126,
  escalon: "CIERRE",
  pregunta: "la condicion de reapertura de F3-5, ¿exige CLONAR, o el dominio ya esta en el repo?",
  veredicto: estado.every((e) => e.capturado)
    ? "NO EXIGE CLONAR. La varianza inter-instancia es una propiedad del ORIGINAL y los 2 vecinos YA ESTAN CAPTURADOS. La condicion se reescribe como una MEDICION pendiente, no como un si-condicional."
    : "EXIGE CAPTURAR primero: falta el HTML de algun vecino.",
  ancla: ANCLA,
  umbral: UMBRAL,
  vecinos: estado,
  dominio: {
    documentos: FAMILIA_DOCS.map((d) => d.etiqueta),
    marcadores: cuenta.size,
    compartidosEnDosOMas: compartidos.length,
    singleton: singleton.length,
    listaCompartidos: compartidos.map(([m, n]) => ({ marcador: m, documentos: n })),
  },
  porDoc,
  noContesta: [
    "NO mide la varianza: eso exige navegador y geometria, y es trabajo de otra tanda",
    "NO dice si los marcadores compartidos tienen valores distintos — solo que hay con que emparejar",
  ],
  controles,
};

for (const [ruta, texto] of [[join(DERIV, "reapertura-f35-126.json"), JSON.stringify(salida, null, 1)]]) {
  if (existsSync(ruta) && readFileSync(ruta, "utf8") !== texto) { console.error(`❌ ${ruta} existe y DIFIERE — no se pisa (§regla 5).`); process.exit(1); }
  writeFileSync(ruta, texto);
}

const L = [];
const say = (s) => { L.push(s); console.log(s); };
say("=== CONTROLES ===");
for (const c of controles) say(`  ${c.ok ? "OK " : "FALLA"} ${c.nombre}\n      ${c.detalle}`);
say("\n=== LOS 2 VECINOS ===");
for (const e of estado) say(`  ${e.vecino.padEnd(26)} jaccard=${e.jaccard}  capturado=${e.capturado ? "SI" : "NO"}  clonado=${e.clonado ? "SI" : "NO"}`);
say("\n=== DOMINIO (marcadores semanticos de la familia PRODUCTO) ===");
say(`  documentos: ${FAMILIA_DOCS.map((d) => d.etiqueta).join(" · ")}`);
say(`  ${cuenta.size} marcadores · ${compartidos.length} en >=2 documentos · ${singleton.length} singleton`);
for (const [m, n] of compartidos.slice(0, 20)) say(`    ${String(n)} doc(s)  ${m}`);
say(`\n⇒ ${salida.veredicto}`);
const fallos = controles.filter((c) => !c.ok);
say(`\n✓ evaluados ${FAMILIA_DOCS.length}/${FAMILIA_DOCS.length} documentos de la familia · controles ${controles.length - fallos.length}/${controles.length}`);
writeFileSync(join(DERIV, "reapertura-f35-126.log"), L.join("\n") + "\n");
if (fallos.length) { console.error(`❌ ${fallos.length} control(es) en rojo`); process.exit(1); }
