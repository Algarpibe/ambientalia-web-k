/**
 * 143.ª · PASO 0 §4 — EL HUECO DEL INSTRUMENTO, DIMENSIONADO (no arreglado)
 * ════════════════════════════════════════════════════════════════════════
 *
 * LA PREGUNTA, en tres partes que el encargo separa y que NO se contestan igual:
 *
 *   (1) ¿registra hoy algún fichero de `medidas/` el `buildId` SERVIDO?
 *   (2) ¿lo expone de forma barata `.next/BUILD_ID` o la respuesta servida?
 *   (3) añadir un campo al `meta` ¿es ADITIVO o CADUCA las congeladas?
 *
 * ⚠ (1) y (2) tienen una trampa compartida, y es la de siempre: `.next/BUILD_ID`
 * es **el disco**, y el disco es justo el canal que B1 NO mueve. Un fichero que
 * registre «buildId» sin decir de qué canal **no contesta la pregunta**, así que
 * este barrido clasifica por CANAL y no por presencia del campo.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const MEDIDAS = path.join(RAIZ, "scripts/qa/medidas");
const QA = path.join(RAIZ, "scripts/qa");

/* ── (1) el censo de congeladas, por canal ────────────────────────────────── */
const congeladas = fs.readdirSync(MEDIDAS).filter((f) => f.endsWith(".json"));
const conCampo = [];
for (const f of congeladas) {
  let j;
  try { j = JSON.parse(fs.readFileSync(path.join(MEDIDAS, f), "utf8")); } catch { continue; }
  const s = JSON.stringify(j);
  if (/"buildId"|"BUILD_ID"/.test(s)) conCampo.push(f);
}

/* ¿de qué CANAL sale el buildId de cada sonda que lo escribe? Se deriva del
 * fuente: `.next/BUILD_ID` es DISCO; un `fetch` que lo extrae del HTML es
 * SERVIDO. Nada más cuenta. */
const sondas = fs.readdirSync(QA).filter((f) => f.endsWith(".mjs"));
const porCanal = { disco: [], servido: [], entorno: [] };
for (const s of sondas) {
  const src = fs.readFileSync(path.join(QA, s), "utf8");
  if (!/buildId|BUILD_ID/.test(src)) continue;
  const disco = /\.next\/BUILD_ID|RUTA_BUILD_ID|BUILD_ID_INICIAL/.test(src);
  /* SERVIDO = se extrae del cuerpo de una respuesta HTTP. El marcador de Next es
   * la ruta de los manifiestos estáticos: /_next/static/<buildId>/_ssgManifest.js */
  const servido = /_ssgManifest|_next\/static\/\[\^\/\]|buildId["']?\s*[:=][^;]*(html|cuerpo|texto|body)/i.test(src);
  if (servido) porCanal.servido.push(s);
  else if (disco) porCanal.disco.push(s);
  else porCanal.entorno.push(s);
}

/* ── (3) el RADIO: ¿cuántas sondas y cuántas congeladas alcanza tocar lib.mjs? */
const importanLib = sondas.filter((s) => /from "\.\/lib\.mjs"|from '\.\/lib\.mjs'/.test(fs.readFileSync(path.join(QA, s), "utf8")));
/* las que además CONGELAN (llaman a w()) son las que tienen congelada que caducar */
const congelan = importanLib.filter((s) => /\bw\(/.test(fs.readFileSync(path.join(QA, s), "utf8")));
/* y las que miden el CLON (las únicas a las que un buildId servido le dice algo):
 * usan iniciarClon o reciben una base http */
const midenClon = congelan.filter((s) => {
  const src = fs.readFileSync(path.join(QA, s), "utf8");
  return /iniciarClon/.test(src) && !/SIN_CLON\s*=\s*["']1/.test(src);
});

/* familias de congeladas: el prefijo antes del primer `-` de fecha o del `.json` */
const familia = (f) => f.replace(/\.json$/, "").replace(/-\d{4}-\d{2}-\d{2}.*$/, "").replace(/-neg-.*$/, "").replace(/-(1440|390)(-.*)?$/, "");
const familias = new Set(congeladas.map(familia));

/* ── (3) ADITIVO o CADUCA — se contesta con la POLÍTICA de w(), derivada del
 * fuente, no con una opinión. w() compara el CUERPO ENTERO (`previo === cuerpo`)
 * y desvía a un nombre fechado si difiere; nunca reescribe una distinta. */
const libSrc = fs.readFileSync(path.join(QA, "lib.mjs"), "utf8");
const comparaCuerpoEntero = /previo\s*===\s*cuerpo/.test(libSrc);
const desviaSiDifiere = /idéntica a la congelada/.test(libSrc) && /pisar|PISAR/.test(libSrc);

const veredicto3 = {
  wComparaCuerpoEntero: comparaCuerpoEntero,
  wDesviaSiDifiere: desviaSiDifiere,
  /* ADITIVO para el DATO: ningún valor ya medido cambia de valor, así que
   * ninguna afirmación de una congelada se vuelve FALSA — que es la definición
   * de §regla 5bis («arreglar un instrumento CADUCA sus medidas» exige que lo
   * medido pase a ser incorrecto). Aquí sólo pasa a estar INCOMPLETO. */
  aditivoParaElDato: true,
  /* Y NO ADITIVO para la COMPARACIÓN byte a byte: cualquier consumidor que
   * diffee dos congeladas enteras vería el campo nuevo como diferencia. */
  rompeComparacionByteABit: comparaCuerpoEntero,
  /* el coste real, con su número: cada familia que congele con el meta nuevo
   * se desvía a un nombre fechado en su PRIMERA corrida, y el canónico sigue
   * conservando la vieja (§regla 5, el efecto conocido). */
  familiasQueSeDesviarianEnSuPrimeraCorrida: midenClon.length,
};

const resumen = {
  /* (1) */
  congeladasTotal: congeladas.length,
  congeladasConCampoBuildId: conCampo.length,
  sondasQueEscribenBuildId_porCanal: {
    disco: porCanal.disco.length,
    SERVIDO: porCanal.servido.length,
    otro: porCanal.entorno.length,
  },
  sondasDisco: porCanal.disco,
  sondasServido: porCanal.servido,
  /* (3) */
  sondasEnQA: sondas.length,
  importanLibMjs: importanLib.length,
  importanYCongelan: congelan.length,
  importanYCongelanYMidenClon: midenClon.length,
  familiasDeCongeladas: familias.size,
  veredicto3,
};

/* ── CONTROL por caso conocido, DOS polaridades (§regla 28d) ───────────────
 * T1 · `html-cmp` SÍ escribe buildId y lo saca del DISCO → tiene que salir en
 *      `sondasDisco`. Si saliera en SERVIDO, el clasificador está mintiendo.
 * T2 · `clon-base` NO escribe ningún buildId → tiene que estar FUERA de las tres
 *      listas. Sin T2, un clasificador que metiera todo en «disco» pasaría igual.
 * T3 · la guarda de contaminación de `w()` lee DISCO — el caso que hace que este
 *      hueco exista. Se comprueba en el fuente. */
const t1 = porCanal.disco.includes("html-cmp.mjs");
const t2 = !porCanal.disco.includes("clon-base.mjs") && !porCanal.servido.includes("clon-base.mjs") && !porCanal.entorno.includes("clon-base.mjs");
const t3 = /RUTA_BUILD_ID\s*=\s*enApp\(\s*["']\.next\/BUILD_ID/.test(libSrc);
const control = {
  T1_htmlcmp_es_DISCO: { ok: t1, nota: "html-cmp lee .next/BUILD_ID" },
  T2_clonbase_no_escribe_ninguno: { ok: t2, nota: "clon-base.meta es {width, base, rutas}" },
  T3_guarda_de_w_lee_DISCO: { ok: t3, nota: "RUTA_BUILD_ID = enApp('.next/BUILD_ID') — ciega a un servidor anclado" },
};
control.vale = t1 && t2 && t3;

const salida = { fecha: new Date().toISOString(), resumen, control, congeladasConCampoBuildId: conCampo.sort() };
const dest = path.join(path.dirname(fileURLToPath(import.meta.url)), "buildid-servido-143.json");
fs.writeFileSync(dest, JSON.stringify(salida, null, 2));

console.log("═══ (1)(2)(3) EL HUECO DEL buildId SERVIDO — dimensionado ═══");
console.log(JSON.stringify(resumen, null, 2));
console.log("\n── CONTROL ──");
console.log(JSON.stringify(control, null, 2));
console.log(`\ncongelado en ${path.relative(RAIZ, dest).replace(/\\/g, "/")}`);
if (!control.vale) { console.log("\n⛔ EL CONTROL NO PASA — el dimensionado no vale"); process.exit(1); }
