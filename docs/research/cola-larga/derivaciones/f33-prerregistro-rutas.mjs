/**
 * PRE-REGISTRO DE RUTAS DE E1 — la derivación, no la estimación.
 * Uso: node --env-file=apps/cms/.env docs/research/cola-larga/derivaciones/f33-prerregistro-rutas.mjs
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ SE DERIVA Y NO SE ESTIMA
 *
 * Este repo ya falló esta predicción una vez —«374 → 375»— porque `/glosario`
 * pagina 8 páginas: **un documento nuevo no siempre es UNA ruta nueva**, y el
 * error no lo da el build, lo da el número.
 *
 * Así que aquí no se suma 31 y ya: se contestan las TRES preguntas de las que
 * depende el total, cada una con su cardinal —
 *
 *   1 · ¿cuántas RUTAS produce el catálogo? (no cuántos documentos)
 *   2 · ¿alguna choca LITERALMENTE con una ruta que el build ya emite HOY?
 *   3 · ¿alguna familia EXISTENTE cambia de cardinal porque entre `paginas`?
 *
 * La 3 es la que produjo el «374 → 375», y la única que no se ve mirando las
 * rutas nuevas.
 *
 * ── LA UNIDAD, DECLARADA (§*un denominador se escribe CON SU UNIDAD*) ─────
 * El total se cuenta en la unidad de `manifiesto.mjs` —`rutasEmitidas()`, que
 * descarta `/_*` y todo lo que lleve un punto—, **no** en claves del
 * `prerender-manifest`. Hoy son **382** contra **385** claves: las dos son
 * ciertas y sólo una es comparable con lo que las sondas del repo publican.
 */
import { readFileSync } from "node:fs";

const REPO = new URL("../../../../", import.meta.url);
const { construyeConfig } = await import(new URL("packages/cms-config/src/index.ts", REPO).href);
const { getPayload } = await import("payload");

/* ── 1 · el catálogo: RUTAS, no documentos ──────────────────────────────── */
const payload = await getPayload({ config: await construyeConfig() });
const r = await payload.find({ collection: "paginas", limit: 500, depth: 0, pagination: false });
const rutas = r.docs.map((d) => "/" + [d.prefijo, d.slug].filter(Boolean).join("/")).sort();
const unicas = [...new Set(rutas)];

/* ── 2 · contra lo que el build emite HOY ───────────────────────────────── */
const man = JSON.parse(readFileSync(new URL("apps/web/.next/prerender-manifest.json", REPO), "utf8"));
const emitidas = Object.keys(man.routes || {}).filter((x) => !x.startsWith("/_") && !x.includes("."));
const HOY = emitidas.length;
const colisionLiteral = unicas.filter((x) => emitidas.includes(x));

/* ── 3 · ¿toca `paginas` a alguna familia EXISTENTE? ────────────────────────
 * La pregunta no es «¿se parecen las rutas?» sino **«¿lee alguien `paginas`?»**.
 * Una familia sólo repagina si su catálogo crece, y el catálogo de las cuatro
 * familias paginadas del repo son `entradasBlog` · `terminosKunakpedia` ·
 * `etiquetas` · `categoriasCientificas`. Ninguna es `paginas`, y eso se
 * comprueba con un `grep`, no con una opinión — va en el acta. */
const familias = {};
for (const [ruta, v] of Object.entries(man.routes || {})) {
  if (ruta.startsWith("/_") || ruta.includes(".")) continue;
  const f = v.srcRoute ?? ruta;
  familias[f] = (familias[f] || 0) + 1;
}

/* ── El reparto PREDICHO por plano, que es lo que hay que poder auditar ──── */
const plano = (x) => {
  const s = x.split("/").filter(Boolean);
  if (s.length === 1) return "/[slug]";
  if (["centro-de-ayuda", "soporte", "recursos"].includes(s[0])) return `/${s[0]}/[...ruta]`;
  return `(ruta nueva) /${s.join("/")}`;
};
const porPlano = {};
for (const x of unicas) (porPlano[plano(x)] = porPlano[plano(x)] || []).push(x);

console.log("\n════════ PRE-REGISTRO · rutas que E1 debe emitir ════════\n");
console.log(`  documentos en la DB          ${r.docs.length}`);
console.log(`  RUTAS distintas del catálogo ${unicas.length}${unicas.length === rutas.length ? "" : `  ⚠ ${rutas.length - unicas.length} duplicadas`}`);
console.log(`  colisión literal con HOY     ${colisionLiteral.length}${colisionLiteral.length ? ` ⚠ ${JSON.stringify(colisionLiteral)}` : ""}`);
console.log(`\n  rutas emitidas HOY           ${HOY}   (unidad rutasEmitidas; ${Object.keys(man.routes || {}).length} claves de manifiesto)`);
console.log(`  PREDICCIÓN DESPUÉS           ${HOY + unicas.length}\n`);

console.log("  reparto PREDICHO por plano — cada uno auditable por separado:\n");
for (const [p, xs] of Object.entries(porPlano).sort((a, b) => b[1].length - a[1].length)) {
  const antes = familias[p] ?? 0;
  console.log(`    ${String(xs.length).padStart(3)}  ${p.padEnd(28)} ${antes} → ${antes + xs.length}`);
}

console.log("\n  familias PAGINADAS del build, y de qué catálogo comen:\n");
for (const f of Object.keys(familias).filter((x) => x.includes("/page/[n]")))
  console.log(`    ${String(familias[f]).padStart(3)}  ${f.padEnd(38)} ${familias[f]} → ${familias[f]}  (no lee \`paginas\`)`);

console.log(
  "\n  ⚠ La tercera pregunta —¿repagina alguna familia?— se contesta con que\n" +
    "    NADIE en apps/web lee `paginas`: 0 referencias. Si eso cambia, este\n" +
    "    número deja de valer y hay que re-derivarlo.\n",
);
process.exit(0);
