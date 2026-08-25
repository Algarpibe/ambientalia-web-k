/**
 * EL NEGATIVO DE `kb-barra` — corrido ANTES de que exista el lado que va a medir.
 * Uso: npm run qa:kb-barra-neg
 *
 * ══════════════════════════════════════════════════════════════════════════
 * §regla 24: *el negativo de un comparador se corre ANTES de que exista el lado
 * que va a medir*. Aquí el clon todavía no emite nada en la barra lateral, y
 * casi todas las preguntas de este negativo **no dependen de eso**: se
 * contestan sobre el lado que sí existe. La ganancia no es de calendario, es de
 * ATRIBUCIÓN — cuando el clon emita, un rojo sólo podrá ser suyo.
 *
 * ⚠ Y los casos NO se atan al código de salida de una comparación (§regla 21,
 * la vuelta): se atan a lo que es cierto en los dos estados del objeto — que la
 * sonda **alcanza su dominio**, que **publica sus ejes** y que **discrimina lo
 * que dice discriminar**.
 *
 * ── LA TABLA ─────────────────────────────────────────────────────────────
 * | caso            | qué anula                          | qué tiene que pasar |
 * |-----------------|------------------------------------|---------------------|
 * | `control`       | nada                               | mide 13/13, censo vivo, cruce OK; sale ⛔ SÓLO por las 14 hojas que faltan (exit 5) |
 * | `selector-muerto`| el selector de la barra           | exit 2 · «selector MUERTO» — §sondas 4: no puede salir «no hay barra» |
 * | `sin-fuentes`   | las 4 hojas de fuente              | los NÚMEROS SE MUEVEN — un canal sin síntoma en el total (§regla 34) |
 * | `sin-hojas`     | las hojas del corpus               | los NÚMEROS SE MUEVEN — «plausible y falsa» (§F3-1-CSS-NO-CAPTURADO) |
 * | `dominio-corto` | el dominio: 1 página por familia   | NO SE PUDO EVALUAR (2 < 13) — §regla 22: la varianza 0 con n=1 es por construcción |
 *
 * ⚠ **`sin-hojas` y `sin-fuentes` NO se comprueban por el código de salida**, y
 * es a propósito: una captura sin sus hojas **no da error, da una medida
 * plausible**. Lo que prueba que la precondición muerde es que **el número
 * cambie**, así que el caso compara la congelada del sabotaje contra la del
 * control. Un caso atado al `exit` habría salido verde sin ejercitar nada
 * (§regla 28a — el sabotaje se pone en el DATO, no en el umbral).
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const SONDA = join(AQUI, "kb-barra.mjs");
const MED = join(AQUI, "medidas");
const ANCHO = process.argv[2] || "1440";

const corre = (env, etiqueta) => {
  const r = spawnSync(process.execPath, [SONDA, ANCHO], {
    cwd: join(AQUI, "..", ".."),
    env: { ...process.env, ...env },
    encoding: "utf8",
    timeout: 600_000,
  });
  const salida = (r.stdout ?? "") + (r.stderr ?? "");
  console.log(`   [${etiqueta}] exit ${r.status === null ? "AGOTADO" : r.status} · ${salida.split("\n").length} líneas`);
  return { exit: r.status, salida };
};

const lee = (f) => (existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null);
/** La geometría que un sabotaje de canal tiene que mover. §regla 34: se mide
 *  POR ELEMENTO, no por un total — el total tiene el signo de «no pasa nada». */
const huella = (j) =>
  Object.entries(j?.paginas ?? {}).map(([r, p]) =>
    [r, p.columna?.rect.h, p.barra?.rect.h, p.menu?.ulRect.h, p.menu?.items?.[0]?.aRect?.h].join("|"),
  ).join("\n");

const casos = [];
const apunta = (nombre, ok, detalle) => { casos.push({ nombre, ok, detalle }); console.log(`   ${ok ? "✓" : "✗"} ${nombre}: ${detalle}`); };

console.log(`\n═══ kb-barra.neg @${ANCHO} ═══\n`);

/* ── 1 · CONTROL — sin sabotaje. Es lo que da sentido a los demás (§regla 8) ─ */
console.log("1 · control (sin sabotaje)");
const fControl = join(MED, `kb-barra-${ANCHO}.json`);
const ctl = corre({ PISAR: "1" }, "control");
const jc = lee(fControl);
apunta(
  "control · alcanza su dominio",
  !!jc && Object.keys(jc.paginas).length === 13 && /evaluadas 13\/13/.test(ctl.salida),
  `${Object.keys(jc?.paginas ?? {}).length} páginas medidas, 13 esperadas`,
);
apunta(
  "control · el cruce con el VIVO cuadra al nivel de la COLUMNA",
  !!jc?.cruceVivo && jc.cruceVivo.mal === 0 &&
    Object.values(jc.cruceVivo.contra).every((c) => c.delta.w === 0 && c.delta.h === 0),
  jc?.cruceVivo ? `Δw/Δh = 0 en ${Object.keys(jc.cruceVivo.contra).length} familias · y en pico ${JSON.stringify(jc.cruceVivo.picosY)}` : "sin cruce",
);
apunta(
  "control · cae en ROJO por las hojas que faltan, NO en verde (§regla 31)",
  ctl.exit === 5 && /HOJAS INCOMPLETAS/.test(ctl.salida),
  `exit ${ctl.exit} — y publica los números igualmente, que es lo que este negativo compara`,
);
const huellaControl = huella(jc);

/* ── 2 · SELECTOR MUERTO — §sondas 4 ────────────────────────────────────── */
console.log("\n2 · selector-muerto");
const r2 = corre({ SABOTAJE: "selector-muerto", NEG: "selector-muerto", PISAR: "1" }, "selector-muerto");
apunta(
  "selector-muerto · sale por ERROR, no por «no hay barra»",
  r2.exit === 2 && /selector\(es\) MUERTOS/.test(r2.salida),
  `exit ${r2.exit} · un cero de selector NO se puede leer como dato`,
);

/* ── 3 · SIN FUENTES — un canal sin síntoma en el total (§regla 34) ──────── */
console.log("\n3 · sin-fuentes");
const r3 = corre({ SABOTAJE: "sin-fuentes", NEG: "sin-fuentes", PISAR: "1" }, "sin-fuentes");
const h3 = huella(lee(join(MED, `kb-barra-${ANCHO}-neg-sin-fuentes.json`)));
apunta(
  "sin-fuentes · los NÚMEROS SE MUEVEN",
  !!h3 && h3 !== huellaControl,
  h3 ? (h3 === huellaControl ? "IDÉNTICOS ⇒ el canal no muerde y el caso no prueba nada" : "distintos ⇒ el canal muerde") : "no congeló",
);

/* ── 4 · SIN HOJAS — «plausible y falsa» ─────────────────────────────────── */
console.log("\n4 · sin-hojas");
const r4 = corre({ SABOTAJE: "sin-hojas", NEG: "sin-hojas", PISAR: "1" }, "sin-hojas");
const j4 = lee(join(MED, `kb-barra-${ANCHO}-neg-sin-hojas.json`));
const h4 = huella(j4);
apunta(
  "sin-hojas · los NÚMEROS SE MUEVEN (no basta el exit: una captura sin hojas RENDERIZA)",
  !!h4 && h4 !== huellaControl,
  h4 ? (h4 === huellaControl ? "IDÉNTICOS ⇒ el sabotaje no muerde" : "distintos ⇒ muerde") : "no congeló",
);
apunta(
  "sin-hojas · y lo dice: 0 hojas resueltas en las 13",
  !!j4 && Object.values(j4.paginas).every((p) => p.hojas.resueltas === 0),
  j4 ? `resueltas máx ${Math.max(...Object.values(j4.paginas).map((p) => p.hojas.resueltas))}` : "—",
);

/* ── 5 · DOMINIO CORTO — §regla 22 ──────────────────────────────────────── */
console.log("\n5 · dominio-corto");
const r5 = corre({ SABOTAJE: "dominio-corto", NEG: "dominio-corto", PISAR: "1" }, "dominio-corto");
apunta(
  "dominio-corto · NO SE PUDO EVALUAR (2 < 13), pese a que la varianza saldría 0",
  r5.exit !== 0 && /NO SE PUDO EVALUAR|evaluadas 2\/13/.test(r5.salida),
  `exit ${r5.exit} · con n=1 la varianza es 0 por construcción y el veredicto lo pondría el dominio`,
);

/* ── VEREDICTO ──────────────────────────────────────────────────────────── */
const mal = casos.filter((c) => !c.ok);
console.log(`\n═══ VEREDICTO · ${casos.length - mal.length}/${casos.length} casos`);
for (const c of mal) console.log(`   ✗ ${c.nombre} — ${c.detalle}`);
console.log(`\n  ⚠ lo que este negativo NO prueba: que el lado del CLON esté bien. Hoy no existe.`);
if (mal.length) process.exit(1);
