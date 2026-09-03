/**
 * 143.ª · ESCALÓN 3 — QUÉ MEDIDAS QUEDAN BAJO SOSPECHA, Y POR QUÉ EXACTAMENTE
 * ═════════════════════════════════════════════════════════════════════════
 *
 * El encargo permite dejar `iniciarClon()` fichada «pero entonces se dice qué
 * medidas quedan bajo sospecha por ella, CON SU CARDINAL». Derivarlo obliga a
 * separar DOS sospechas que se confunden, y sólo una tiene cardinal > 0:
 *
 *   S1 · LA MUDEZ (`stdio:"ignore"` en el servidor del clon).
 *        **Cardinal 0**, y con mecanismo: `iniciarClon` **TIRA** si el servidor
 *        no contesta en 90 s (`throw new Error("el clon no respondió…")`), así
 *        que un servidor que no arranca **no produce congelada**: produce una
 *        excepción. Lo que la mudez pierde es el MOTIVO, no la detección. Es
 *        una pérdida de diagnóstico, no de validez.
 *
 *   S2 · **EL DISCRIMINANTE AUSENTE.** Ninguna congelada registra el `buildId`
 *        SERVIDO ni si el clon fue PROPIO o EXTERNO (`CLON=`). Así que ninguna
 *        se puede interrogar sobre qué build midió — y ése es el cardinal que
 *        hay que publicar.
 *
 * ⚠ Y las dos NO son la misma sospecha: arreglar la mudez **no mueve S2**, y
 * arreglar S2 (el `buildId` en el `meta`) no necesita tocar la mudez. Meterlas
 * en un solo número sería §*dos definiciones del mismo conjunto*.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const QA = path.join(RAIZ, "scripts/qa");
const MEDIDAS = path.join(QA, "medidas");

/* ── las sondas que MIDEN EL CLON: son las únicas a las que un buildId servido
 * le dice algo. Se derivan por `iniciarClon`, no por una lista (§regla 9). */
const sondas = fs.readdirSync(QA).filter((f) => f.endsWith(".mjs"));
const midenClon = sondas.filter((f) => {
  const s = fs.readFileSync(path.join(QA, f), "utf8");
  return /\biniciarClon\b/.test(s) && /\bw\(/.test(s);
});

/* ── S1 · ¿cuántas congeladas pudo escribir un clon que no arrancó? ──────── */
const libSrc = fs.readFileSync(path.join(QA, "lib.mjs"), "utf8");
const tiraSiNoArranca = /throw new Error\(`el clon no respondió/.test(libSrc);

/* ── S2 · las congeladas de esas sondas, y cuántas llevan discriminante ──── */
const congeladas = fs.readdirSync(MEDIDAS).filter((f) => f.endsWith(".json"));
/* prefijo de sonda: el nombre del `.mjs` sin extensión, descartando `.neg` */
const prefijos = midenClon.map((f) => f.replace(/\.neg\.mjs$|\.mjs$/, "")).filter((p) => !p.startsWith("lib"));
const deSondasDeClon = congeladas.filter((f) => prefijos.some((p) => f === `${p}.json` || f.startsWith(`${p}-`)));

let conServido = 0, conPropioExterno = 0, conBuildIdDeDisco = 0;
for (const f of deSondasDeClon) {
  let j;
  try { j = JSON.parse(fs.readFileSync(path.join(MEDIDAS, f), "utf8")); } catch { continue; }
  const meta = JSON.stringify(j.meta ?? {});
  if (/buildIdServido|servidoBuildId/.test(meta)) conServido++;
  if (/"propio"|"externo"|"clonExterno"/.test(meta)) conPropioExterno++;
  if (/"buildId"/.test(meta)) conBuildIdDeDisco++;
}

/* ── LA CONSTRICCIÓN que estrecha S2, y es la más barata disponible: para que
 * un clon EXTERNO entre en juego alguien tiene que poner `CLON=` a mano. Si
 * ningún script de npm lo pone, la hipótesis del anclaje exige una acción
 * manual **que el archivo no registra**. */
const pkg = JSON.parse(fs.readFileSync(path.join(RAIZ, "package.json"), "utf8"));
const scriptsConClon = Object.entries(pkg.scripts).filter(([, v]) => /\bCLON=/.test(v)).map(([k]) => k);

const resumen = {
  S1_LA_MUDEZ: {
    congeladasBajoSospecha: 0,
    mecanismo: tiraSiNoArranca
      ? "`iniciarClon` TIRA si el clon no responde en 90 s, así que un servidor que no arranca no produce congelada: produce excepción. La mudez pierde el MOTIVO, no la detección"
      : "⚠ NO se halló el `throw` — si no tira, este cardinal NO es 0 y hay que re-derivarlo",
    tiraSiNoArranca,
  },
  S2_EL_DISCRIMINANTE_AUSENTE: {
    sondasQueMidenElClonYCongelan: midenClon.length,
    congeladasDeEsasSondas: deSondasDeClon.length,
    conBuildIdServido: conServido,
    conPropioOExterno: conPropioExterno,
    conBuildIdDeDisco: conBuildIdDeDisco,
    /* el cardinal que se publica: las que NO se pueden interrogar */
    sinDiscriminante: deSondasDeClon.length - conServido,
  },
  CONSTRICCION: {
    scriptsDeNpmQuePonenCLON: scriptsConClon.length,
    nombres: scriptsConClon,
    lectura:
      scriptsConClon.length === 0
        ? "un clon EXTERNO exige poner `CLON=` A MANO. La hipótesis del anclaje no se puede descartar, pero requiere una acción manual que el archivo no registra"
        : "hay scripts que lo ponen: el anclaje es alcanzable sin acción manual y el cardinal de arriba se lee distinto",
  },
};

/* ── CONTROL por caso conocido (§regla 28c), dos polaridades ──────────────
 * C1 · `clon-base` mide el clon y congela ⇒ tiene que estar en `midenClon`.
 * C2 · `ruido` mide SÓLO el original (declara `SIN_CLON`) ⇒ NO puede estar.
 *      Sin C2, un detector que metiera todas las sondas pasaría C1 igual. */
const c1 = midenClon.includes("clon-base.mjs");
const c2 = !midenClon.includes("ruido.mjs");
const control = {
  C1_clonbase_mide_el_clon: { ok: c1 },
  C2_ruido_no_mide_el_clon: { ok: c2, nota: "mide sólo el original: si saliera dentro, el detector no discrimina" },
};
control.vale = c1 && c2;

const salida = { fecha: new Date().toISOString(), resumen, control, sondasQueMidenElClon: midenClon.sort() };
const dest = path.join(path.dirname(fileURLToPath(import.meta.url)), "bajo-sospecha-143.json");
fs.writeFileSync(dest, JSON.stringify(salida, null, 2));

console.log("═══ QUÉ QUEDA BAJO SOSPECHA, con su cardinal ═══");
console.log(JSON.stringify(resumen, null, 2));
console.log("\n── CONTROL ──");
console.log(JSON.stringify(control, null, 2));
console.log(`\ncongelado en ${path.relative(RAIZ, dest).replace(/\\/g, "/")}`);
if (!control.vale) { console.log("\n⛔ EL CONTROL NO PASA"); process.exit(1); }
