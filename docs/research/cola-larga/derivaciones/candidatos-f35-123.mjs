// 123.ª · PASO 0 (2) — por CANDIDATO: regimen, captura, instancias.
//
// El regimen se lee con LOS DOS marcadores y se nombra la combinacion, incluida
// la vacia (`--`), porque la tabla tiene CUATRO casilleros y el cuarto no lleva
// ninguno.
//
// Y la SEGUNDA señal de `-T` no discrimina sola (§116.ª): una plantilla PHP
// puede COPIAR la clase `…_tb_body`. El invariante que si discrimina es el
// CONTADOR — el constructor numera cada seccion una vez, asi que
// `ocurrencias == distintos`. Con occ == 1 el test es DEGENERADO: las dos
// hipotesis predicen lo mismo, sale INDETERMINADO.
//
// CONTROL (§regla 8): el detector tiene que separar. Si los N documentos dan la
// MISMA combinacion y ademas la muestra no contiene ningun `-T` conocido, no se
// puede afirmar que el detector discrimine: se publica esa limitacion con su
// cardinal en vez de un verde.

import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { join, basename } from "node:path";

const CORPUS = "corpus";

function htmlsDe(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...htmlsDe(p));
    else if (/\.html$/.test(e.name)) out.push(p.replace(/\\/g, "/"));
  }
  return out;
}

function regimen(ruta) {
  const src = readFileSync(ruta, "utf8");
  const mBody = src.match(/<body[^>]*>/i);
  const body = mBody ? mBody[0] : "";
  const B = /et_pb_pagebuilder_layout/.test(body);
  const T = /et-tb-has-body/.test(body);

  // invariante de la 2.ª señal: ¿estan NUMERADAS las secciones _tb_body?
  const occ = [...src.matchAll(/et_pb_section_(\d+)_tb_body/g)].map((m) => m[1]);
  const dis = new Set(occ).size;
  let invariante;
  if (occ.length === 0) invariante = "sin secciones _tb_body";
  else if (occ.length === 1) invariante = "DEGENERADO (occ==1)";
  else if (occ.length === dis) invariante = `numeradas (${occ.length}==${dis}) -> constructor`;
  else invariante = `REPETIDAS (${occ.length}!=${dis}) -> clase copiada a mano`;

  return {
    combinacion: (B ? "B" : "-") + (T ? "T" : "-"),
    marcadorBuilder: B,
    marcadorPlantilla: T,
    seccionesTbBody: { ocurrencias: occ.length, distintos: dis, invariante },
    // n.º de secciones propias del builder = instancia editada por una persona
    seccionesPropias: new Set([...src.matchAll(/et_pb_section_(\d+)(?!_tb)/g)].map((m) => m[1])).size,
    bytes: src.length,
    // hojas enlazadas: canal de captura (§4.º canal)
    hojasEnlazadas: [...src.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi)].length,
  };
}

// ── candidatos: se DERIVAN del corpus, no se escriben a mano ─────────────────
const grupos = {
  "PRODUCTO / CATALOGO / SOFTWARE (corpus/productos)": htmlsDe(join(CORPUS, "productos")),
  "SECTOR + MONOGRAFICO (corpus/fase-3-sectores)": htmlsDe(join(CORPUS, "fase-3-sectores")),
};

const filas = [];
for (const [grupo, htmls] of Object.entries(grupos)) {
  for (const h of htmls) filas.push({ grupo, fichero: h, doc: basename(h, ".html"), ...regimen(h) });
}

// ¿existe captura de HOME? — hecho NEGATIVO, se comprueba contra el archivo.
//
// ⚠ La v1 filtraba por nombre de fichero —/(index|home|inicio|kunakair)\.html$/—
// y casaba 256 documentos: TODOS los index.html de listado. Es §sondas 4 en su
// cara de SOBRE-CASADO, y su salida («HOME capturada: SI») es la contraria a la
// verdadera. HOME no se identifica por su NOMBRE: se identifica por su
// CANONICAL, que es la raiz del sitio y no lleva ruta detras.
const todos = htmlsDe(CORPUS);
const RAIZ = /<link[^>]+rel=["']canonical["'][^>]+href=["']https?:\/\/[^/"']*kunakair\.com\/(es\/)?["']/i;
const candidatosHome = todos.filter((p) => {
  try { return RAIZ.test(readFileSync(p, "utf8").slice(0, 60000)); } catch { return false; }
});
// CONTROL del detector de HOME: tiene que ver canonicals (si no, su cero es el
// del filtro, no el del corpus) y no puede casar en todas.
const conCanonical = todos.filter((p) => {
  try { return /rel=["']canonical["']/i.test(readFileSync(p, "utf8").slice(0, 60000)); } catch { return false; }
}).length;

// ── CONTROLES ────────────────────────────────────────────────────────────────
const controles = [];
const combis = new Set(filas.map((f) => f.combinacion));
controles.push({
  nombre: "el detector LEE algo (>=1 documento con marcador)",
  ok: filas.some((f) => f.marcadorBuilder || f.marcadorPlantilla),
  visto: `${filas.length} documentos, combinaciones: ${[...combis].join(" ")}`,
});
// separadora: ¿hay en el REPO algun documento con la otra combinacion? Si no,
// este detector no ha demostrado que discrimine sobre esta muestra.
const fuera = todos.filter((p) => !filas.some((f) => f.fichero === p)).slice(0, 400);
const combisFuera = new Map();
for (const p of fuera) {
  try {
    const c = regimen(p).combinacion;
    combisFuera.set(c, (combisFuera.get(c) ?? 0) + 1);
  } catch { /* documento ilegible: no cuenta */ }
}
controles.push({
  nombre: "el detector DISCRIMINA (>=2 combinaciones en el corpus)",
  ok: new Set([...combis, ...combisFuera.keys()]).size >= 2,
  visto: `en candidatos: ${[...combis].join(" ")} | fuera (${fuera.length} docs): ${[...combisFuera].map(([k, v]) => k + "×" + v).join(" ")}`,
});

controles.push({
  nombre: "el detector de HOME no es un cero de filtro ni un pleno",
  ok: conCanonical > 0 && candidatosHome.length < todos.length,
  visto: `${conCanonical} de ${todos.length} docs traen canonical; casan la RAIZ: ${candidatosHome.length}`,
});

// desglose de instancias por SUBFAMILIA (un directorio del corpus = una familia)
const porSubfamilia = new Map();
for (const f of filas) {
  const dir = f.fichero.split("/").slice(0, -1).join("/");
  porSubfamilia.set(dir, (porSubfamilia.get(dir) ?? 0) + 1);
}

const salida = {
  meta: {
    tanda: "123.ª · PASO 0 (2)",
    fecha: new Date().toISOString().slice(0, 10),
    contesta: ["regimen por los DOS marcadores", "captura si/no", "n.º de instancias capturadas por arquetipo"],
    noContesta: [
      "que ejes de dos lados tiene cada uno (se deriva de COBERTURA-MEDICION.md y de medidas/)",
      "si el contenido de lib es plantilla o campo (eso es el ESCALON 2)",
    ],
  },
  controles,
  home: {
    capturada: candidatosHome.length > 0,
    candidatosVistos: candidatosHome,
    docsConCanonical: conCanonical,
    docsTotales: todos.length,
    nota: "hecho NEGATIVO comprobado contra el archivo, no de memoria (§regla 8b)",
  },
  combinacionesFueraDeCandidatos: Object.fromEntries(combisFuera),
  instanciasPorSubfamilia: Object.fromEntries([...porSubfamilia].sort((a,b)=>b[1]-a[1])),
  filas,
};

writeFileSync("docs/research/cola-larga/derivaciones/candidatos-f35-123.json", JSON.stringify(salida, null, 2) + "\n", "utf8");

console.log("=== CONTROLES ===");
for (const c of controles) console.log(`  ${c.ok ? "OK " : "RED"} ${c.nombre}\n      ${c.visto}`);
console.log("");
console.log("=== REGIMEN POR CANDIDATO (los DOS marcadores) ===");
let g = "";
for (const f of filas) {
  if (f.grupo !== g) { g = f.grupo; console.log(`\n  -- ${g}`); }
  console.log(
    `  ${f.combinacion}  ${f.doc.padEnd(46)} secc.propias=${String(f.seccionesPropias).padStart(2)}  hojas=${String(f.hojasEnlazadas).padStart(2)}  ${f.seccionesTbBody.invariante}`,
  );
}
console.log("");
console.log(`=== HOME capturada: ${salida.home.capturada ? "SI" : "NO"} — casan la RAIZ ${candidatosHome.length} de ${todos.length} docs (${conCanonical} traen canonical) ===`);
if (candidatosHome.length) for (const c of candidatosHome.slice(0, 5)) console.log("      " + c);
console.log("");
console.log("=== INSTANCIAS CAPTURADAS por arquetipo ===");
for (const [d, n] of [...porSubfamilia].sort((a, b) => b[1] - a[1])) console.log(`  ${n.toString().padStart(2)}  ${d}`);

const nulo = controles.some((c) => !c.ok);
console.log("");
console.log(`VEREDICTO: ${nulo ? "NULA — control en rojo" : "valida"}`);
if (nulo) process.exit(1);
