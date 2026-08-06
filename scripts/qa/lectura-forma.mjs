/**
 * ¿LA FORMA DEL CANARIO GENERALIZA? — la derivación que decide el alcance de
 * F2-3, en vez de suponerlo.
 *
 * Uso: node --env-file=apps/cms/.env scripts/qa/lectura-forma.mjs
 *
 * ── Por qué existe ────────────────────────────────────────────────────────
 * El encargo de F2-3 dice *«la primera familia es el canario — si sale limpia,
 * las demás siguen su forma»*. La primera (`faqs`) salió limpia con un
 * proyector **escrito a mano de cuatro campos escalares**, uno a uno. Copiar
 * esa forma a las demás sin mirar sería la FAMILIA DE CALIBRACIÓN de manual:
 * heredar los valores del primer contexto medido.
 *
 * Lo que decide si generaliza no es una impresión, es **cuántas de las cuatro
 * transformaciones de FORMA** (`scripts/seed/mapeo.mjs`, cabecera) tiene cada
 * colección: `upload` (ruta de imagen ↔ id de media), `relationship` (término
 * embebido ↔ id), `blocks` (unión por clave ↔ `blockType`) y `richText`
 * (`MonoInline` ↔ Lexical). Un proyector a mano las re-implementa **todas**, y
 * eso es la segunda lista escrita a mano contra la que avisa ese mismo fichero.
 *
 * Congela `medidas/lectura-forma.json`: la conclusión se cita en el acta de
 * F2-3, y una conclusión citada tiene que tener su fichero (regla 2).
 */
import { Evaluadas, familiasDinamicas, hoy, leeManifiesto, w } from "./lib.mjs";

process.env.SIN_CLON = "1";

const { construyeConfig } = await import("../../packages/cms-config/src/index.ts");
const config = await construyeConfig();

/** Las familias de ruta y de qué colección leen. Derivado del build + el catálogo. */
const FAMILIAS = {
  "/faqs/[slug]": ["faqs"],
  "/casos-de-exito/[slug]": ["casos"],
  "/case-studies/[slug]": ["casos"],
  "/recursos/[...ruta]": ["documentos-cientificos"],
  "/[slug]": ["entradas-blog", "terminos-kunakpedia"],
  "/sectores/[slug]": ["sectores", "monograficos"],
};

const TIPOS = ["upload", "relationship", "blocks", "richText", "array"];

function cuenta(campos, acc = Object.fromEntries(TIPOS.map((t) => [t, 0])), hojas = { n: 0 }) {
  for (const c of campos ?? []) {
    if (c?.type && TIPOS.includes(c.type)) acc[c.type]++;
    else if (c?.name) hojas.n++;
    if (Array.isArray(c.fields)) cuenta(c.fields, acc, hojas);
    if (Array.isArray(c.blocks)) for (const b of c.blocks) cuenta(b.fields, acc, hojas);
  }
  return { acc, hojas };
}

const emitidas = new Set(familiasDinamicas(leeManifiesto()));
/* El mínimo se DERIVA del build: una familia dinámica nueva sube el listón sola
 * y esta derivación deja de estar completa hasta que se la declare arriba. */
const ev = new Evaluadas({ nombre: "lectura-forma", unidad: "familias de ruta", minimo: emitidas.size });

console.log(`\n════════ ¿generaliza la forma del canario? ════════\n`);
console.log(
  `  ${"familia de ruta".padEnd(26)} ${"colección".padEnd(22)} ` +
    TIPOS.map((t) => t.padStart(13)).join("") + "   hojas",
);

const salida = { meta: { fecha: hoy(), familias: emitidas.size }, familias: {} };
for (const familia of [...emitidas].sort()) {
  const cols = FAMILIAS[familia];
  if (!cols) {
    /* Una familia que el build emite y esta derivación no conoce NO se salta en
     * silencio: sería la regla del cero — «no la miré» leído como «no aporta». */
    ev.fallo(familia, "el build la emite y no está declarada aquí");
    console.log(`  ${familia.padEnd(26)} ❌ SIN DECLARAR en esta derivación`);
    continue;
  }
  salida.familias[familia] = {};
  for (const col of cols) {
    const cfg = config.collections.find((c) => c.slug === col);
    if (!cfg) {
      ev.fallo(`${familia}/${col}`, "no está en la config");
      console.log(`  ${familia.padEnd(26)} ${col.padEnd(22)} ❌ no está en la config`);
      continue;
    }
    const { acc, hojas } = cuenta(cfg.fields);
    const total = TIPOS.reduce((a, t) => a + acc[t], 0);
    salida.familias[familia][col] = { ...acc, hojas: hojas.n, transformaciones: total - acc.array };
    console.log(
      `  ${familia.padEnd(26)} ${col.padEnd(22)} ` +
        TIPOS.map((t) => String(acc[t]).padStart(13)).join("") +
        `   ${String(hojas.n).padStart(5)}` +
        (total === 0 ? "   ← escalares: el proyector a mano vale" : ""),
    );
  }
  ev.ok();
}

w("medidas/lectura-forma.json", salida);
console.log(
  `\n  Leyenda: las cuatro primeras columnas son las transformaciones de FORMA de\n` +
    `  \`scripts/seed/mapeo.mjs\`. Cero en las cuatro ⇒ el proyector es copiar campos.\n`,
);
process.exit(ev.informe() ? 1 : 0);
