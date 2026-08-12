/**
 * EL CONTRATO DE `mbPorDefecto` — ejercitado, no leído.
 * Uso: node scripts/qa/lh-rol.mjs        (npm run qa:lh-rol)
 *
 * ── De dónde sale ─────────────────────────────────────────────────────────
 * De §LH-CONTENEDOR-ROL: `911.75` es el ancho de la **FILA** en `articulos-kb`
 * (39/39 filas medidas) y el de una **COLUMNA `3_4`** en `L1`, cuya fila mide
 * **1238.39**. Mientras la firma recibía **un número suelto**, pasarle el de
 * `L1` **no daba error: devolvía el default del otro arquetipo** —25.0625 donde
 * tocan 34.0469—.
 *
 * Hasta el 2026-08-11 la guarda era **un aviso en la cabecera de la función**, y
 * este repo tiene la regla escrita: §sondas 3, **DOCUMENTADO NO ES CONECTADO**.
 * Un comentario no prueba que el arreglo esté cableado — y aquél ni siquiera
 * afirmaba un arreglo, sólo advertía. El precedente correcto estaba **en la
 * misma función**: para un ancho sin medir, **TIRA**. Ahora el rol recibe ese
 * mismo trato.
 *
 * ── Qué comprueba ─────────────────────────────────────────────────────────
 * Compila `defaults.ts` con `esbuild` —el mismo camino que usa
 * `extractor-kb`, para no reescribir la tabla aquí (clase C7)— y **llama a la
 * función**. Que el `throw` esté escrito no prueba que salte.
 *
 * ── Guardas ───────────────────────────────────────────────────────────────
 * 1 · `Evaluadas`, mínimo derivado del nº de casos declarados;
 * 2 · congela en `medidas/lh-rol.json`;
 * 3 · negativo: `SABOTAJE=invierte` — cambia lo que se espera de cada caso, y
 *     la sonda tiene que reportar fallo en todos. Sin él, un test que sólo
 *     pasa no distingue «la guarda salta» de «no la estoy ejercitando».
 */
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Evaluadas, hoy, QA, w } from "./lib.mjs";

const SAB = process.env.SABOTAJE ?? "";
const RAIZ = join(QA, "../..");
const require = createRequire(import.meta.url);
const esbuild = require("esbuild");
const tmp = join(QA, ".tmp");
mkdirSync(tmp, { recursive: true });
const bundle = join(tmp, "defaults-rol.mjs");
await esbuild.build({
  entryPoints: [join(RAIZ, "packages/cms-config/src/defaults.ts")],
  outfile: bundle,
  bundle: true,
  platform: "node",
  format: "esm",
  logLevel: "silent",
});
const { mbPorDefecto, ANCHO_FILA_CASCARON, ANCHO_FILA_KB } = await import(pathToFileURL(bundle).href);

/** Los casos, con su procedencia. `tira: true` = tiene que lanzar. */
const CASOS = [
  { que: "MONOGRÁFICO/SECTOR · fila del cascarón, 4_4", args: [ANCHO_FILA_CASCARON, "4_4", "fila"], espera: { px1440: 34.0469, px390: 30 } },
  { que: "MONOGRÁFICO/SECTOR · fila del cascarón, columna estrecha", args: [ANCHO_FILA_CASCARON, "1_2", "fila"], espera: { px1440: 34.0469, px390: 30 } },
  { que: "articulos-kb · fila 911.75, 4_4", args: [ANCHO_FILA_KB, "4_4", "fila"], espera: { px1440: 34.0469, px390: 30 } },
  { que: "articulos-kb · fila 911.75, columna estrecha", args: [ANCHO_FILA_KB, "2_3", "fila"], espera: { px1440: 25.0625, px390: 30 } },
  /* ── Los tres que tienen que TIRAR ─────────────────────────────────────── */
  { que: "⛔ L1 · el 911.75 que es una COLUMNA, declarado como tal", args: [ANCHO_FILA_KB, "3_4", "columna"], tira: /COLUMNA/ },
  { que: "⛔ L1 · el mismo 911.75 SIN declarar el rol (la llamada vieja)", args: [ANCHO_FILA_KB, "3_4"], tira: /falta el ROL/ },
  { que: "⛔ L3-sci · fila de 1152, un ancho sin medir", args: [1152, "4_4", "fila"], tira: /SIN MEDIR/ },
];

const ev = new Evaluadas({ nombre: "lh-rol", unidad: "casos del contrato", minimo: CASOS.length });

const filas = [];
let fallos = 0;
for (const c of CASOS) {
  /* El sabotaje invierte lo que se espera: los que devuelven valor pasan a
   * esperarse como `throw` y al revés. Todos tienen que reportar fallo. */
  const esperaTirar = SAB === "invierte" ? !c.tira : !!c.tira;
  let resultado, error = null;
  try {
    resultado = mbPorDefecto(...c.args);
  } catch (e) {
    error = e.message;
  }
  const tiro = error !== null;
  let ok = tiro === esperaTirar;
  if (ok && tiro && c.tira instanceof RegExp && SAB !== "invierte") ok = c.tira.test(error);
  if (ok && !tiro && c.espera && SAB !== "invierte") ok = JSON.stringify(resultado) === JSON.stringify(c.espera);
  if (!ok) fallos++;
  filas.push({
    que: c.que,
    args: c.args.map((x) => (x === undefined ? "(sin rol)" : x)),
    esperaTirar,
    tiro,
    resultado: resultado ?? null,
    error: error ? error.split("\n")[0] : null,
    ok,
  });
  ev.ok();
}

console.log(`\n═══ EL CONTRATO DE mbPorDefecto — ${CASOS.length} casos EJERCITADOS${SAB ? ` · SABOTAJE=${SAB}` : ""}`);
for (const f of filas)
  console.log(`  ${f.ok ? "✓" : "✗"} ${f.que.padEnd(56)} (${f.args.join(", ")})  →  ${f.tiro ? `TIRA: ${f.error.slice(0, 46)}…` : JSON.stringify(f.resultado)}`);
console.log(`\n  fallos: ${fallos}/${CASOS.length}`);
console.log(`✓ evaluadas ${CASOS.length}/${CASOS.length} casos del contrato · rol de mbPorDefecto`);

w("medidas/lh-rol.json", {
  meta: {
    fecha: hoy(),
    pregunta: "¿la firma de mbPorDefecto EXIGE el rol del ancho, o un número suelto sigue devolviendo el default del otro arquetipo?",
    fuente: "packages/cms-config/src/defaults.ts compilado con esbuild — la función se LLAMA, no se lee",
    sabotaje: SAB || null,
    porQue: "§LH-CONTENEDOR-ROL: 911.75 es FILA en articulos-kb y COLUMNA 3_4 en L1. Hasta hoy la guarda era un comentario, y §sondas 3 dice que documentado no es conectado.",
    noMide: ["si algún llamador pasa el rol EQUIVOCADO: eso lo dice el tipo (TS) en los .ts y el throw en runtime, pero un .mjs que mienta a conciencia no lo caza nadie"],
  },
  casos: filas,
  fallos,
  veredicto: fallos === 0 ? "el contrato se cumple en los 7 casos: los 4 que devuelven valor lo devuelven exacto y los 3 que deben tirar tiran" : `${fallos} caso(s) del contrato NO se cumplen`,
});

process.exit(fallos ? 2 : 0);
