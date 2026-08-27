/**
 * ¿CUÁNTOS «ROTOS» HAY? — DEPENDE DE LA UNIDAD, Y LA SONDA PUBLICA UNA SOLA
 * Uso: node docs/research/cola-larga/derivaciones/enlaces-rotos-unidad-120.mjs
 *      (con el clon servido en localhost:3000)
 *
 * ── Por qué ─────────────────────────────────────────────────────────────────
 *
 * `qa:enlaces` publica `rotos: 4` y deduplica con `vistosRotos.has(href)`, así
 * que su unidad es **href DISTINTO** y el campo `pagina` guarda sólo **la
 * primera** página que lo sirvió. Leído como «4 páginas rotas» —que es la
 * lectura natural— el número es falso: el mismo `href` sin fragmento lo sirven
 * varias páginas y todas menos una se descartan.
 *
 * Es §*un cardinal es un contenedor y absorbe la membresía* con el contenedor
 * puesto en el `Set` de deduplicación, y §regla 14 —*una limitación declarada
 * sin su número se lee como una nota al pie*— sobre la unidad.
 *
 * Esta derivación cuenta las TRES unidades por separado y las publica juntas.
 * No sustituye a la sonda: la lee en su unidad y añade las que le faltan.
 */
import { writeFileSync } from "node:fs";

const BASE = process.env.CLON || "http://localhost:3000";
const RE_OFUSCADO = /\/cdn-cgi\/l\/email-protection[^"'\\ >]*/g;
const RE_DECODER = /email-decode/g;

/* Las rutas salen del build, no de una lista escrita a mano. */
const { createRequire } = await import("node:module");
const require_ = createRequire(import.meta.url);
const man = require_("../../../../apps/web/.next/prerender-manifest.json");
const RUTAS = Object.keys(man.routes || {}).filter(
  (r) => !r.startsWith("/_") && !r.split("/").pop().includes("."),
);

const porPagina = [];
let fallos = 0;
for (const ruta of RUTAS) {
  let html;
  try {
    const res = await fetch(BASE + ruta);
    if (!res.ok) { fallos++; continue; }
    html = await res.text();
  } catch { fallos++; continue; }
  const hrefs = [...(html.match(RE_OFUSCADO) || [])];
  if (!hrefs.length) continue;
  porPagina.push({
    ruta,
    hrefs: [...new Set(hrefs)],
    nApariciones: hrefs.length,
    decoder: (html.match(RE_DECODER) || []).length,
  });
}

/* ── Guarda: si NINGUNA página lo sirve, el cero es del instrumento ── */
if (fallos > 0) {
  console.error(`\n❌ ${fallos} de ${RUTAS.length} rutas no se pudieron servir: corrida NULA.`);
  process.exitCode = 1;
}
if (porPagina.length === 0) {
  console.error(
    `\n❌ CERO páginas con el ofuscador en ${RUTAS.length} rutas.` +
      `\n   La sonda \`qa:enlaces\` reporta 4 rotos sobre este mismo clon, así que` +
      `\n   un cero aquí es del selector, no del original.`,
  );
  process.exitCode = 1;
}

const hrefsDistintos = new Set(porPagina.flatMap((p) => p.hrefs));
const apariciones = porPagina.reduce((a, p) => a + p.nApariciones, 0);
const conDecoder = porPagina.filter((p) => p.decoder > 0).length;

console.log(`\n═══ EL OFUSCADOR DE CLOUDFLARE, EN SUS TRES UNIDADES\n`);
console.log(`  rutas servidas y recorridas ....... ${RUTAS.length - fallos}/${RUTAS.length}`);
console.log(`  PÁGINAS que lo sirven ............. ${porPagina.length}`);
console.log(`  HREFS distintos ................... ${hrefsDistintos.size}   ← la unidad de \`qa:enlaces\``);
console.log(`  APARICIONES totales ............... ${apariciones}`);
console.log(`  de esas páginas, CON descifrador .. ${conDecoder}   ← si no es 0, no todas son media unidad`);
console.log(`\n  página                                              hrefs  aparic  decoder`);
for (const p of porPagina.sort((a, b) => b.nApariciones - a.nApariciones))
  console.log(
    "  " + p.ruta.padEnd(52) + String(p.hrefs.length).padStart(5) +
      String(p.nApariciones).padStart(8) + String(p.decoder).padStart(9),
  );

const salida = {
  meta: {
    fecha: "2026-08-27",
    tanda: "120.ª ESCALÓN 1",
    rutas: RUTAS.length,
    servidas: RUTAS.length - fallos,
  },
  unidades: {
    paginas: porPagina.length,
    hrefsDistintos: hrefsDistintos.size,
    apariciones,
    paginasConDescifrador: conDecoder,
  },
  porPagina,
};
writeFileSync(
  new URL("./enlaces-rotos-unidad-120.json", import.meta.url),
  JSON.stringify(salida, null, 1),
  "utf8",
);
console.log(`\n→ derivaciones/enlaces-rotos-unidad-120.json`);
